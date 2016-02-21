/**
 * Created by hanwencheng on 2/10/16.
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {isLoaded, onLoad, onLocationChange, onDeleteHouse} from 'redux/modules/admin';
import {bindActionCreators} from 'redux';
import {List} from "components";
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';

import {DropDownMenu, MenuItem,RaisedButton} from 'material-ui';

import myRawTheme from '../../theme/materialUI.theme';

//@ThemeDecorator(ThemeManager.getMuiTheme(myRawTheme))
@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      //console.log("after load we get state:", getState().router)
      return dispatch(onLoad(getState().auth.user._id));
    }
  }
}])

@connect(
  state => ({
    userId : state.auth.user._id,
    entities: state.admin.list,
    error: state.admin.error,
    loading: state.admin.loading,
    loaded: state.admin.loaded,
    locationId : state.admin.locationId,
  }),
  {onLoad, onLocationChange, onDeleteHouse}
)
export default class Entities extends Component {
  static propTypes = {
    entities : PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    locationId : PropTypes.number,
    loaded :PropTypes.bool,
    userId : PropTypes.string,

    onDeleteHouse : PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onLocationChange: PropTypes.func.isRequired,
  };

  loadList = (event) => {
      event.preventDefault();
      this.props.onLoad(this.props.userId);
  }

  render() {
    const styles = require('./UserAdmin.scss');
    const {loaded, error, loading, onLoad} = this.props;
    const houses = this.props.entities;

    let refreshClassName = 'fa fa-refresh';
    if (loading) {
      refreshClassName += ' fa-spin';
    }

    return (
      <div>
        <Helmet title="我的发布"/>
        <div className={styles.listNav}>
          <RaisedButton onClick={this.loadList} style={{lineHeight: "36px" }}><i className={refreshClassName}/> 刷新</RaisedButton>
        </div>

        {loaded &&
        <div className={styles.gridContainer}>
          { houses.length ?
            <List houses={this.props.entities} onDeleteHouse={this.props.onDeleteHouse}/>
            :
            <div className={styles.noHouseYet}><p>Ooops! 您还没有发布任何房源!</p></div>}
        </div>
        }

        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true">sorry</span>
          {' '}
          {error}
        </div>}
      </div>
    );
  }
}