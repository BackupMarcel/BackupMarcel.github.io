import React, { Component } from 'react';
import './App.css';
import { Row, Col, Layout, Card, Carousel, Form, Input, Button, Radio, Result } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faFile, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import CryptoJS from 'crypto-js';

const { Content } = Layout;
const { TextArea } = Input;

class Property extends Component {
    onChangeKey(e) {
        var property = {...this.props.property};
        property.key = e.target.value

        this.props.update(property)
    }

    onChangeValue(e) {
        var property = {...this.props.property};
        property.value = e.target.value

        this.props.update(property)
    }

    render() {
        return (
            <div>
                <Form.Item name={'key' + this.props.property.id}>
                    <Input 
                    prefix={<FontAwesomeIcon 
                    icon={faKey} 
                    className="icon-input" />} 
                    type="text" 
                    placeholder="Key" 
                    value={this.props.property.key} 
                    autoComplete="off" 
                    onChange={(e) => this.onChangeKey(e)} 
                />
                </Form.Item>
                <Form.Item name={'value' + this.props.property.id}>
                    <Input 
                        prefix={<FontAwesomeIcon 
                        icon={faFile} 
                        className="icon-input" />} 
                        type="text" 
                        placeholder="Value" 
                        value={this.props.property.value} 
                        autoComplete="off"
                        onChange={(e) => this.onChangeValue(e)} 
                    />
                </Form.Item>
            </div>
        );
    }
}

class Properties extends Component {
    constructor(props) {
        super(props);

        this.index = 0;
        this.propertiesRef = React.createRef();
        this.state = {
            propertiesPos: 0,
            properties: [{id: this.index}]
        }
    }

    addProperty() {
        this.index = this.index + 1
        const property = {
            id: this.index,
            key: '',
            value: ''
        }
        const properties = [...this.props.properties, property];
        this.props.onChange(properties);
        this.propertiesRef.goTo(this.props.properties.length)
    }

    removeProperty(index) {
        const properties = [...this.props.properties];
        properties.splice(index, 1);
        this.props.onChange(properties);
        this.propertiesRef.goTo(this.state.propertiesPos)
    }

    updateProperty(property) {
        const properties = this.props.properties.map(propertyCurrent =>
            propertyCurrent.id === property.id ? property : propertyCurrent
        );

        this.props.onChange(properties);
    }

    onChangePropertiesPos(pos) {
        this.propertiesRef.goTo(pos);
        this.setState(prevState => ({
            propertiesPos: pos
        }))
    }

    render() {
        return (
            <Form.Item label={<div>Properties <small>Text</small></div>}>
                <Row gutter={[5, 15]}>
                    <Col span={24}>
                            <Row gutter={5}>
                                <Col span={3}>
                                    <Button size="small" className="button-step" disabled={this.state.propertiesPos <= 0} onClick={() => this.propertiesRef.prev()}>
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </Button>
                                </Col>
                                <Col span={9} className="align-center property-current">
                                    <Button size="small" className="button-step" onClick={() => this.addProperty()}>
                                        Add
                                    </Button>
                                </Col>
                                <Col span={9} className="align-center property-current">
                                    <Button size="small" className="button-step" disabled={this.props.properties.length <= 0} onClick={() => this.removeProperty(this.state.propertiesPos)}>
                                        Remove
                                    </Button>
                                </Col>
                                <Col span={3} className="align-right">
                                    <Button size="small" className="button-step" disabled={this.state.propertiesPos >= this.props.properties.length - 1} onClick={() => this.propertiesRef.next()}>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </Button>
                                </Col>
                            </Row>
                    </Col>
                    <Col span={24}>
                        <Carousel ref={(ref) => this.propertiesRef = ref} afterChange={(pos) => this.onChangePropertiesPos(pos)} dotPosition="top" className="properties-content">
                            {
                                this.props.properties.map((property, index) => {
                                    return <Property key={property.id} update={(property) => this.updateProperty(property)} property={property} />
                                })
                            }
                        </Carousel>
                    </Col>  
                </Row>
            </Form.Item>
        )
    };
}

class CryptoInput extends Component {
    constructor(props) {
        super(props);

        this.index = 0;
        this.state = {
            mode: 0,
            inputEncrypt: '',
            inputDecrypt: '',
            iv: '',
            properties: [{id: this.index}]
        }
    }

    packProperties(properties) {
        const packed = properties.reduce(function(result, property) {
            if (typeof property.key === 'string' && property.key !== '' && 
                typeof property.value === 'string' && property.value !== '') {
                result.push([property.key.toLowerCase(), property.value]);
            }

            return result
        }, []);

        return packed;
    }

    onChangeMode(mode) {
        this.setState(prevState => ({
            mode: mode
        }))
    }

    onChangeInputEncrypt(input) {
        this.setState(prevState => ({
            inputEncrypt: input
        }))
    }

    onChangeInputDecrypt(input) {
        this.setState(prevState => ({
            inputDecrypt: input
        }))
    }

    onChangeIv(iv) {
        this.setState(prevState => ({
            iv: iv
        }))
    }

    onChangeProperties(properties) {
        this.setState(prevState => ({
            properties: properties
        }))
    }

    onFinish() {
        const properties = this.packProperties(this.state.properties);
        if (this.state.mode === 0) {
            this.props.onEncrypt(this.state.inputEncrypt, properties);
        }
        else if (this.state.mode === 1) {
            this.props.onDecrypt(this.state.inputDecrypt, this.state.iv, properties);
        }
    }

    render() {
        return (
            <Form className="form-crypto-input" layout="vertical" onFinish={() => this.onFinish()}>
                <Row gutter={[5, 0]}>
                    <Col span={24}>
                        <Form.Item label="Mode">
                            <Radio.Group onChange={(e) => this.onChangeMode(e.target.value)} value={this.state.mode}>
                                <Radio value={0}>Encrypt</Radio>
                                <Radio value={1}>Decrypt</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    {
                        this.state.mode === 0 &&
                        <Col span={24}>
                            <Form.Item label={<div>Input <small>Text</small></div>}>
                                <TextArea rows={1} value={this.state.inputEncrypt} autoComplete="off" onChange={(e) => this.onChangeInputEncrypt(e.target.value)} />
                            </Form.Item>
                        </Col>
                    }
                    {
                        this.state.mode === 1 &&
                        <Col span={24}>
                            <Form.Item label={<div>Input <small>Base64</small></div>}>
                                <Input type="text" value={this.state.inputDecrypt} autoComplete="off" onChange={(e) => this.onChangeInputDecrypt(e.target.value)} />
                            </Form.Item>
                        </Col>
                    }
                    {
                        this.state.mode === 1 &&
                        <Col span={24}>
                            <Form.Item label={<div>IV <small>Base64</small></div>}>
                                <Input type="text" value={this.state.iv} autoComplete="off" onChange={(e) => this.onChangeIv(e.target.value)} />
                            </Form.Item>
                        </Col>
                    }
                    <Col span={24}>
                        <Properties properties={this.state.properties} onChange={(properties) => this.onChangeProperties(properties)} />
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="button-submit">
                                {this.state.mode === 0 ? 'Encrypt' : 'Decrypt'}
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        )
    };
}

class CryptoResult extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    onFocus(e) {
        e.target.select();
    }

    render() {
        return (
            <Form className="form-crypto-result" layout="vertical">
                <Row gutter={[0, 0]}>
                    <Col span={24}>
                        {
                            this.props.result.error 
                            ? <Result  status="error" title={this.props.result.mode === 0 ? 'Encryption failed' : 'Decryption failed'} />
                            : <Result status="success" title={this.props.result.mode === 0 ? 'Encryption success' : 'Decryption success'}/>
                        }
                    </Col>
                    {
                        this.props.result.key &&
                        <Col span={24}>
                            <Form.Item label={<div>Key <small>Base64</small></div>}>
                                <Input type="text" value={this.props.result.key} className="input-hide" onFocus={this.onFocus} />
                            </Form.Item>
                        </Col>
                    }
                    {
                        this.props.result.iv &&
                        <Col span={24}>
                            <Form.Item label={<div>IV <small>Base64</small></div>}>
                                <Input type="text" value={this.props.result.iv} onFocus={this.onFocus} />
                            </Form.Item>
                        </Col>
                    }
                    {
                        !this.props.result.error &&
                        <Col span={24}>
                            <Form.Item label={<div>Result <small>{this.props.result.mode === 0 ? 'Base64' : 'Text'}</small></div>}>
                                <TextArea rows={1} value={this.props.result.mode === 0 ? this.props.result.encryption : this.props.result.decryption} onFocus={this.onFocus} />
                            </Form.Item>
                        </Col>
                    }
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" className="button-submit" onClick={() => {this.props.onFinish()}}>
                                Close
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        )
    };
}

class Crypto extends Component {
    constructor(props) {
        super(props);

        this.onEncrypt = this.onEncrypt.bind(this);
        this.onDecrypt = this.onDecrypt.bind(this);

        this.state = {
            step: 0
        }
    }

    onEncrypt(input, properties) {
        const propertiesStr = JSON.stringify(properties, null, 0);
        const key = CryptoJS.SHA256(propertiesStr);
        const iv = CryptoJS.lib.WordArray.random(16);
        const cipher = CryptoJS.AES.encrypt(input, key, {
            iv: iv, 
            mode: CryptoJS.mode.CBC,        //CBC (default), CFB, CTR, OFB, ECB 
            padding: CryptoJS.pad.Pkcs7     //Pkcs7 (default), Iso97971, AnsiX923, Iso10126, ZeroPadding, NoPadding
        });

        var encryption = CryptoJS.enc.Base64.stringify(cipher.ciphertext);

        this.result = {
            mode: 0,
            key: CryptoJS.enc.Base64.stringify(key),
            iv: CryptoJS.enc.Base64.stringify(iv),
            encryption: encryption,
        };
        this.setStep(1);
    }

    onDecrypt(input, iv, properties) {
        const propertiesStr = JSON.stringify(properties, null, 0);
        const key = CryptoJS.SHA256(propertiesStr);
        iv = CryptoJS.enc.Base64.parse(iv);
        const cipher = CryptoJS.AES.decrypt(input, key, {
            iv: iv, 
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7
        });

        var decryption = null;
        try {
            decryption = CryptoJS.enc.Utf8.stringify(cipher);
        } catch (error) {

        }

        if (decryption) {
            this.result = {
                mode: 1,
                decryption: decryption
            };
        } else {
            this.result = {
                mode: 1,
                error: true
            };
        }

        this.setStep(1);
    }

    onResultFinish(text, mode, properties) {
        this.setStep(0);
    }

    setStep(state) {
        this.setState({
            step: state
        });
    }

    render() {
        return (
            <Layout className="layout">
                <Content className="layout-content">
                    <Card className="card">
                    {
                        this.state.step === 0 && <CryptoInput onEncrypt={this.onEncrypt} onDecrypt={this.onDecrypt} />
                    }
                    {
                        this.state.step === 1 && <CryptoResult result={this.result} onFinish={() => {this.onResultFinish()}} />
                    }
                    </Card>
                </Content>
            </Layout>
        )
    };
}

export default Crypto
