/**
 * Created by hanwencheng on 1/22/16.
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {capitalizeFirstLetter, findCityValue} from '../../utils/help';

import {onEndEdit, onAddImage, onChangeSlide,
  onDeleteImage, onToggleLimit, onChangeType, onChangePriceType, onLogError} from "redux/modules/entity";
import {Carousel} from 'components';
import submitValidation from './submitValidation'
import uiStyles from '../../theme/uiStyles'
import Select from 'react-select';
import strings from '../../constant/strings';
import {onSetError} from 'redux/modules/error';

import {TextField, FontIcon, RaisedButton, Card, MenuItem,
  IconButton, CardMedia, CardTitle, CardText, List, ListItem, SelectField,
  DatePicker, Toggle, RadioButton, RadioButtonGroup} from 'material-ui';

import config from '../../config'
import DropZone from 'react-dropzone'
import defaultCityList from '../../constant/cityList';

@connect(
  state => ({
    entity: state.entity.data,
    hasLimit : state.entity.hasLimit,
    initialValues : state.entity.data,
    cachedImages : state.entity.cachedImages,
    currentSlide : state.entity.currentSlide,
  }),
  {onEndEdit, onAddImage, onChangeSlide, onDeleteImage, onToggleLimit, onChangeType, onChangePriceType, onLogError, onSetError}
)

@reduxForm({
  form: 'house',
  //later should delete images in fields
  fields : ['city','location','size','price','caution','startDate','endDate','priceType',
    'description','title','owner','email','phone', 'type','note', 'images', 'wechat',
    'username'],
  validate : submitValidation,
  //asyncValidate,
  //asyncBlurFields: ["email", "name"],
})
export default class SubmitForm extends Component {
  static propTypes = {
    entity: PropTypes.object,
    onEndEdit: PropTypes.func.isRequired,
    onAddImage : PropTypes.func.isRequired,
    onDeleteImage : PropTypes.func.isRequired,
    onChangeSlide : PropTypes.func.isRequired,
    onToggleLimit : PropTypes.func.isRequired,
    onChangeType : PropTypes.func.isRequired,
    onLogError : PropTypes.func.isRequired,
    onChangePriceType : PropTypes.func.isRequired,
    onSetError : PropTypes.func.isRequired,
    cachedImages: PropTypes.array,
    currentSlide : PropTypes.number,
    hasLimit : PropTypes.bool,

    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    nextSlide :PropTypes.func,
    previousSlide : PropTypes.func,
  }

  dateFormat = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return year + "." + month + "." + day
    //return day + '/' + month + '/' + year;
  }

  calculateNumber = ()=> {
    return this.props.entity.images.length + this.props.cachedImages.length
  }

  onDrop = (files) => {
    if(!Array.isArray(files)){
      files = [files];
    }else{
      if(files.length + this.calculateNumber()> config.limitImageNumber){
        files = files.slice(0, config.limitImageNumber - this.calculateNumber())
        this.props.onSetError(strings.maxNumberImageError);
      }
    }
    this.props.onAddImage(files);
  }

  onDeleteButton = () => {
    this.props.onDeleteImage(this.props.currentSlide);
  }

  render() {
    require('../../theme/react-select.css')
    const styles = require('./SubmitForm.scss');
    const {
      fields: {location,city,size,price,caution,startDate,endDate,
        description,title,owner,email,phone,type,note,priceType,images, wechat},
      entity,
      hasLimit,
      currentSlide,
      //resetForm,
      cachedImages,
      handleSubmit,
      submitting,
      //asyncValidating
      } = this.props;

    var Decorators = [
      {component: React.createClass({render() {
        return (
          <div className={styles.arrowContainer1} onClick={this.props.previousSlide}>
            <i className={styles.arrowIcon + " fa fa-angle-left fa-2x"}/>
          </div>)}
      }),
        position: 'CenterLeft', style: {height: "100%"}},
      {component: React.createClass({render() {
        return (
          <div className={styles.arrowContainer1} onClick={this.props.nextSlide}>
            <i className={styles.arrowIcon + " fa fa-angle-right fa-2x"}/>
          </div>)}
      }),
        position: 'CenterRight', style: {height: "100%"}},
    ];

    const pickerStyle ={
      display:'inline'
    }

    //Deprecated
    const errorStyle = (value) =>{
      const withOutError = styles.withOutError
      const withError = " "+ styles.withError
      return value.error && value.touched? withError : withOutError
    }

    const onCityChange =(selectObject)=>{
      var value = selectObject ? selectObject.value : null ;
      if(value === ""){
        return city.onChange(null)
      }
      city.onChange(value !== null ? selectObject.label : null)
    }

    const inputStyle = { width : "250px"}

    const validateSubmit = (data)=> {
      var fields = this.props.fields;
      //console.log('fields is', fields)
      var anyError = []
      for (var property in fields){
        if(fields.hasOwnProperty(property)){
          if(fields[property].error){
            anyError.push(property )
          }
        }
      }
      if(anyError.length){
        return this.props.onLogError("未填写"  + anyError.join(", "));
      }
      handleSubmit(data)
    }

    return (
      <form className={styles.container} onSubmit={validateSubmit}>

        <Card className={styles.card}>
          <div className={styles.buttonContainer}>
            { currentSlide <= this.calculateNumber() - 1 &&
            <IconButton iconClassName="fa fa-times-circle" tooltip={strings.deleteImageTooltip}  touch={true}
                        style={{"width" : "60px", "height": "60px"}}
                        iconStyle = {{"fontSize" : "30px"}}
                        tooltipPosition="top-center" onClick={this.onDeleteButton}/>}
          </div>
          <CardMedia>
            <Carousel key={211} className={styles.slider}
                      decorators={Decorators}
                      framePadding="50px" width="100%" slidesToShow={1}
                      onChange={this.props.onChangeSlide}>
              {entity.images && entity.images.length >= 1 && entity.images.map( address =><div className={styles.imageContainer} key={address + "show"}><img src={address}/></div>)}
              {cachedImages && cachedImages.length >= 1 && cachedImages.map(file => <div className={styles.imageContainer} key={file.name + "cache"}><img src={window.URL.createObjectURL(file)}/></div>)}
              {this.calculateNumber() < config.limitImageNumber &&
                <div className={styles.imageContainer}>
                  <DropZone onDrop={this.onDrop}>
                    <div className={styles.inner}>
                      <div className={styles.innerText}>请点击选择图片或将图片拖动到框中,<font color="#FF6F6F">最多上传<b><font>{config.limitImageNumber}</font></b>张图片</font></div>
                      <div className={styles.innerFont}>
                        <span className="fa fa-plus-circle fa-5x"/>
                      </div>
                    </div>
                  </DropZone>
                </div>
              }
            </Carousel>
          </CardMedia>
          <div className={styles.cardTitle}>
            <CardTitle>
                {/* directly display the require error here since it hard to find */}
              <TextField key={201} hintText="标题" floatingLabelText="标题" errorText={title.touched && title.error ? title.error : null} {...title}/>
            </CardTitle>
          </div>
          <CardText style={uiStyles.cardText}>
              <textarea key={202} className={"form-control " + styles.textArea} rows="8" placeholder="填写一些具体介绍吧" {...description}/>
          </CardText>
        </Card>

        <div className={styles.list}>
          <div className={styles.innerList}>
            <div className={styles.rowContainerCity}>
              <div className={styles.city}><i className="fa fa-location-arrow"/> 城市 </div>
              <Select
                className={styles.select}
                name="selectPostCity"
                options={defaultCityList}
                value={city.value === null ? "" : findCityValue(defaultCityList, city.value)}
                onChange={onCityChange}
                noResultsText={strings.selectNoResultsSubmit}
                placeholder={strings.selectPlaceholderSubmit}
                ignoreAccents={false}
              />
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-map-marker"/> 地址 </div>
              <div><TextField key={20} style={inputStyle} errorText={location.touched && location.error ? location.error : null} {...location}/></div>
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-square"/> 面积 </div>
              <div><TextField key={40} style={inputStyle} errorText={size.touched && size.error ? size.error : null} {...size}/></div>
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-eur"/> 租金 </div>
              <div><TextField key={50} style={inputStyle} errorText={price.touched && price.error ? price.error : null} {...price}/></div>
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-lock"/> 押金 </div>
              <div><TextField key={60} style={inputStyle} errorText={caution.touched && caution.error ? caution.error : null} {...caution}/></div>
            </div>

            {/* the width should be 265px */}
            <div className={styles.rowContainerDate}>
              <DatePicker key={81} autoOk={true} value={new Date(startDate.value)} hintText="开始日期" textFieldStyle={uiStyles.datePicker}
                          onChange={(event, newDate) => startDate.onChange(newDate)} formatDate={this.dateFormat}/>
              <Toggle label="短期" toggled={hasLimit} labelPosition="right" style={uiStyles.toggle} onToggle={(event, isToggled) => {
                 this.props.onToggleLimit(isToggled)
                 if(isToggled){
                 endDate.onChange(new Date())
                 }else{
                 endDate.onChange(null)
                 }
                 }}/>
              { hasLimit &&
              <DatePicker key={82} autoOk={true} value={new Date(endDate.value)} hintText="结束日期" textFieldStyle={uiStyles.datePicker}
                          onChange={(event, newDate) => endDate.onChange(newDate)} formatDate={this.dateFormat}/>
              }
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.radioContainer}>
              <RadioButtonGroup name="costType" style={uiStyles.buttonGroup}
                                valueSelected={priceType.value == null ? null : priceType.value.toString()}
                                onChange={(event, value)=> {
                 var boolean = value === "true"
                 console.log('change value is', value)
                 priceType.onChange(boolean)}}
               >
                <RadioButton
                  value="false"
                  label="暖租"
                  style={uiStyles.warmCold}
                  labelStyle={uiStyles.warmCold}
                />
                <RadioButton
                  value="true"
                  label="冷租"
                  style={uiStyles.warmCold}
                  labelStyle={uiStyles.warmCold}
                />
              </RadioButtonGroup>
              </div>
            </div>

            <div className={styles.rowContainer}>
              <div className={styles.radioContainer}>
              <RadioButtonGroup name="costType" style={uiStyles.buttonGroup}
                                valueSelected={type.value == null ? null : type.value.toString()}
                                onChange={(event, value)=> {
                   var boolean = value === "true"
                   type.onChange(boolean)}}
              >
                <RadioButton
                  value="false"
                  label="WG"
                  style={uiStyles.warmCold}
                  labelStyle={uiStyles.warmCold}
                />
                <RadioButton
                  value="true"
                  label="Wohnung/Appartment"
                  style={uiStyles.warmCold}
                  labelStyle={uiStyles.warmCold}
                />
              </RadioButtonGroup>
              </div>
            </div>
            <div className={styles.rowContainer + " " + styles.buttonGroup}>
              <div className={styles.rowTitle}><i className="fa fa-envelope"/> 邮箱 </div>
              <div><TextField key={110} style={inputStyle} errorText={email.touched && email.error ? email.error : null} {...email}/></div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-phone"/> 手机 </div>
              <div><TextField key={120} style={inputStyle} errorText={phone.touched && phone.error ? phone.error : null} {...phone}/></div>
            </div>
            <div className={styles.rowContainer}>
              <div className={styles.rowTitle}><i className="fa fa-wechat"/> 微信 </div>
              <div><TextField key={130} style={inputStyle} errorText={wechat.touched && wechat.error ? wechat.error : null} {...wechat}/></div>
            </div>
            <div className={styles.submit}>
              <RaisedButton style={uiStyles.buttonStyle} key={13} className={styles.editButton} onClick={validateSubmit}><span/> 提交</RaisedButton>
            </div>
          </div>
        </div>
      </form>
    )
  }
}
