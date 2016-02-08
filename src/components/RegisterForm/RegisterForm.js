/**
 * Created by hanwencheng on 1/13/16.
 */

import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import registerValidation from './registerValidation';
import {check as checkEmail} from 'redux/modules/auth';
import {TextField, RaisedButton} from 'material-ui';
import uiStyles from '../../theme/uiStyles';

const enableAsyncCheck = false;
const asyncValidate = (value, dispatch) => {
  if(enableAsyncCheck){
    //return new Promise((resolve, reject) =>{
    //
    //})
    return dispatch(checkEmail(value))
  }

  return new Promise((resolve, reject) => {
    console.log('sync validate value is disable now.')
    resolve()
  })
}

@connect(
  state => ({
    loggingIn: state.auth.loggingIn,
  }),
  {}
)

@reduxForm({
  form: 'register',
  fields : ['email', 'username', 'password', 'passwordRepeat'],
  validate : registerValidation,
  asyncValidate,
  asyncBlurFields: ["email", "name"],
})

export default class RegisterForm extends Component{
  static propTypes = {
    asyncValidating: PropTypes.bool.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    loggingIn: PropTypes.bool.isRequired
  }

  render() {
    const styles = require('./RegisterForm.scss');
    const {
      fields: {email, username, password, passwordRepeat},
      resetForm,
      handleSubmit,
      asyncValidating,
      loggingIn} = this.props;
    const isPasswordSame = password.value && passwordRepeat.value && passwordRepeat.value === password.value;

    const inputStyle = uiStyles.inputStyle;
    const buttonStyle = uiStyles.buttonStyle;

    const getError = ()=>{
      if(passwordRepeat.touched){
        if(passwordRepeat.error){
          return passwordRepeat.error
        }else if(password.touched && !isPasswordSame){
          return "Password is not same";
        }
      }
      return null;
    }

    return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <div className={'form-group'}>
        <label>Email</label>
        <div>
          <TextField type="text" hintText="Email" style={inputStyle}
                     errorText={email.touched && email.error ? email.error : null}  {...email}/>
        </div>
      </div>
      <div className={'form-group'}>
        <label>用户名</label>
        <div>
          <TextField type="text" hintText="Username" style={inputStyle}
                     errorText={username.touched && username.error ? username.error : null} {...username}/>
          {asyncValidating === 'username' && <i /* spinning cog *//>}
        </div>
      </div>
      <div className={'form-group'}>
        <label>密码</label>
        <div>
          <TextField type="text" hintText="Password" style={inputStyle}
                     errorText={password.touched && password.error ? password.error : null} {...password}/>
        </div>
      </div>
      <div className={'form-group'}>
        <label>重复密码</label>
        <div>
          <TextField type="text" hintText="Repeat Password" style={inputStyle}
                     errorText={getError()} {...passwordRepeat}/>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <RaisedButton disabled={isPasswordSame ? loggingIn : "true"} style={buttonStyle} onClick={handleSubmit}>
          {loggingIn ?
            <span className="fa fa-spin fa-refresh"/>
            :
            <span>Submit</span>
          }
        </RaisedButton>
        <RaisedButton disabled={loggingIn} secondary={true} style={buttonStyle} onClick={resetForm}>
          Clear Values
        </RaisedButton>
      </div>
    </form>
    );
  }
}