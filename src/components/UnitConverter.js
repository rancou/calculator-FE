import React, { Component } from 'react';
import '../css/UnitConverter.css';
import PointTarget from 'react-point';
import axios from 'axios';

class AutoScalingText extends Component {
    state = {
        scale: 1,
    };

    componentDidUpdate() {
        const { scale } = this.state;
        const node = this.node;
        const parentNode = node.parentNode;
        const availableWidth = parentNode.offsetWidth;
        const actualWidth = node.offsetWidth;
        const actualScale = availableWidth / actualWidth;

        if (scale === actualScale) return;

        if (actualScale < 1) {
            this.setState({ scale: actualScale });
        } else if (scale < 1) {
            this.setState({ scale: 1 });
        }
    }

    render() {
        const { scale } = this.state;

        return (
            <div
                className='auto-scaling-text'
                style={{ transform: `scale(${scale},${scale})` }}
                ref={(node) => (this.node = node)}>
                {this.props.children}
            </div>
        );
    }
}

class CalculatorDisplay extends Component {
    render() {
        const { value, ...props } = this.props;
        const language = navigator.language || 'en-US';

        let formattedValue = parseFloat(value).toLocaleString(language, {
            useGrouping: true,
            maximumFractionDigits: 6,
        });

        // Add back missing .0 in e.g. 12.0
        const match = value.match(/\.\d*?(0*)$/);

        if (match) formattedValue += /[1-9]/.test(match[0]) ? match[1] : match[0];

        return (
            <div {...props} className='calculator-display'>
                <AutoScalingText>{formattedValue}</AutoScalingText>
            </div>
        );
    }
}

class CalculatorKey extends Component {
    render() {
        const { onPress, className, ...props } = this.props;

        return (
            <PointTarget onPoint={onPress}>
                <button className={`calculator-key ${className}`} {...props} />
            </PointTarget>
        );
    }
}

const CalculatorOperations = {
    '/': (prevValue, nextValue) => prevValue / nextValue,
    '*': (prevValue, nextValue) => prevValue * nextValue,
    '+': (prevValue, nextValue) => prevValue + nextValue,
    '-': (prevValue, nextValue) => prevValue - nextValue,
    '=': (prevValue, nextValue) => nextValue,
};

class SimpleCalculator extends Component {
    constructor(props){
        super(props);
    this.state = {
        value: null,
        displayValue: '0',
        operator: null,
        waitingForOperand: false,
        selectedType: "area",  
        unit1: "mm2",
        unit2: "mm2",
        result: "0", 
        types: {
            area: ["mm2","cm2", "m2", "km2","in2", "ft2"],
            length: ["mm", "cm", "m", "in", "ft", "mi"],
            temperature: ["C", "K", "F", "R"],
            volume: ["l", "ml", "kl", "mm3", "cm3","km3"],
            mass: ["mg", "kg", "g" ,"oz", "lb", "t"],
            data : ["b", "Kb", "Mb" ],
            speed: ["m/s", "km/h", "m/h", "knot", "ft/s"],
            time: ["ms", "s", "h", "d", "week", "month", "year"],
        }
    };
    this.changeSelectOptionHandler = this.changeSelectOptionHandler.bind(this);
}

    changeSelectOptionHandler(event){ 
        this.setState({
            selectedType: event.target.value,
            unit1: this.state.types[event.target.value][0],
            unit2: this.state.types[event.target.value][0]
        });
        event.preventDefault(); 
    }; 

    clearAll() {
        this.setState({
            value: null,
            displayValue: '0',
            operator: null,
            waitingForOperand: false,
        });
    }

    clearDisplay() {
        this.setState({
            displayValue: '0',
        });
    }

    clearLastChar() {
        const { displayValue } = this.state;
        
        this.setState({
            displayValue: displayValue.substring(0, displayValue.length - 1) || '0',
        });
    }

    toggleSign() {
        const { displayValue } = this.state;
        const newValue = parseFloat(displayValue) * -1;

        this.setState({
            displayValue: String(newValue),
        });
    }

    inputDot() {
        const { displayValue } = this.state;

        if (!/\./.test(displayValue)) {
            this.setState({
                displayValue: displayValue + '.',
                waitingForOperand: false,
            });
        }
    }

    inputDigit(digit) {
        const { displayValue, waitingForOperand } = this.state;

        if (waitingForOperand) {
            this.setState({
                displayValue: String(digit),
                waitingForOperand: false,
            });
        } else {
            const hasDot = displayValue.includes('.');
            const integer = displayValue.split('.')[0];

            if (!hasDot && integer.length >= 10) {
                return;
            }
            this.setState({
                displayValue: displayValue === '0' ? String(digit) : displayValue + digit,
            });
        }
    }

    handleKeyDown = (event) => {
        let { key } = event;

        if (/\d/.test(key)) {
            event.preventDefault();
            this.inputDigit(parseInt(key, 10));
        }else if (key === '.') {
            event.preventDefault();
            this.inputDot();
        }
        else if (key === 'Backspace') {
            event.preventDefault();
            this.clearLastChar();

            if (this.state.displayValue !== '0') {
                this.clearDisplay();
            } else {
                this.clearAll();
            }
        }
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
        if(this.state.selectedType === ""){
            this.setState({
                selectedType: "area"
            });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    componentDidUpdate() {
        console.log(this.state.unit1)
        console.log(this.state.unit2)
    }

    render() { 
    
        let options = null; 
        const { displayValue } = this.state;
        const clearDisplay = displayValue !== '0';
        const clearText = clearDisplay ? 'C' : 'AC';

        const handleChange = (event) => {   
            this.setState({
                unit1: event.target.value
            });
            event.preventDefault(); 
        }; 
        const handleChange2 = (event) => {   
            this.setState({
                unit2: event.target.value
            });
            event.preventDefault(); 
        }; 
        const getResult = ()=>{
            axios.get(`https://converter.doxxie.live/convert?from=${this.state.unit1}&to=${this.state.unit2}&amount=${this.state.displayValue}`)
      .then(res => {
        this.setState({
            result: res.data.converted
        });
      })

        }

        this.state.type = this.state.types[this.state.selectedType]

        if (this.state.type) { 
            options = this.state.type.map((el) => <option key={el}>{el}</option>); 
        } 

        return (
         <div id='test'>
            <div id="measurement">
                <button onClick={this.changeSelectOptionHandler} value="area">Area</button>
                <button onClick={this.changeSelectOptionHandler} value="length">Length</button>
                <button onClick={this.changeSelectOptionHandler} value="temperature" style={{"width":"20%"}}>Temperature</button>
                <button onClick={this.changeSelectOptionHandler} value="volume">Volume</button>
                <button onClick={this.changeSelectOptionHandler} value="mass">Mass</button>
                <button onClick={this.changeSelectOptionHandler} value="data">Data</button>
                <button onClick={this.changeSelectOptionHandler} value="speed">Speed</button>
                <button onClick={this.changeSelectOptionHandler} value="time">Time</button>
            </div> 
                  {/* <select>{options}</select>  */}
                <div className='calculator-body'>
                    <div className='resultContainer'>
                            <div className="first-input">
                            <select value={this.state.unit1} onChange={handleChange}>{options}</select> 
                            <p>
                                <CalculatorDisplay value={displayValue} />
                            </p> 
                            </div>
                            <div className="second-input">
                            <select value={this.state.unit2} onChange={handleChange2}>{options}</select> 
                              <p> 
                                   {this.state.result}
                               </p>
                            </div>
                        </div>
             
                    <div className='button'>
                      
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(7)}>
                                7
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(8)}>
                                8
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(9)}>
                                9
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-light-background'
                                >
                                .
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(4)}>
                                4
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(5)}>
                                5
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(6)}>
                                6
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-light-background'
                                onPress={() => (clearDisplay ? this.clearDisplay() : this.clearAll())}>
                                {clearText}
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(1)}>
                                1
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(2)}>
                                2
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(3)}>
                                3
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-light-background'
                                >.
                                
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.toggleSign()}>
                                ±
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDigit(0)}>
                                0
                            </CalculatorKey>
                            <CalculatorKey
                                className='blue-background'
                                onPress={() => this.inputDot()}>
                                .
                            </CalculatorKey>
                            <CalculatorKey
                                className='operator black-color yellow-background'
                                onPress={getResult}>
                                =
                            </CalculatorKey>


                     
                    </div>
                </div>

            </div>
        );
    }
}

export default SimpleCalculator;
