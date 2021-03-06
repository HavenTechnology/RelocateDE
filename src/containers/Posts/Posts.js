/**
 * Created by hanwencheng on 3/5/16.
 */
import React, {Component, PropTypes} from 'react';
import {GridList, GridTile, Dialog, IconButton, FlatButton, TextField, Snackbar} from 'material-ui';
import {reduxForm} from 'redux-form';
import {Carousel} from 'components';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {isLoaded, onOpenDialog, onCloseDialog , onSetColumn, onDeletePost,
  onDisableAppend, onGetPostList, onLocationChange, onAppendList,
  onClearDeleteFeedback, onGetMyPost,displayArrow, hideArrow} from 'redux/modules/posts';
import {onStartEdit} from 'redux/modules/post'
import {connect} from 'react-redux';
import postValidation from './postValidation'
import connectData from 'helpers/connectData';
import Select from 'react-select';
import Helmet from 'react-helmet';
import uiStyles from '../../theme/uiStyles'
var config = require('../../config');
import cityList from '../../constant/cityList'
import strings from '../../constant/strings'

function fetchDataDeferred(getState, dispatch) {
  var globalState = getState()
  var user = globalState.auth.user
  const promises = [];
  console.log('is loaded is', isLoaded(globalState))
  if (!isLoaded(globalState)) {
    console.log('should ge list now')
    //console.log("after load we get state:", getState().router)
    if(user && user._id) {
      promises.push(
        dispatch(onGetMyPost(user._id))
      );
    }
    promises.push(
      dispatch(onGetPostList(null, cityList, user))
    )
  }
  return Promise.all(promises);
}

@connectData(null, fetchDataDeferred)

@connect(
  state => ({
    posts: state.posts.list,
    myPost : state.posts.myPost,
    popover : state.posts.popover,
    column : state.posts.column,
    error: state.posts.error,
    loading: state.posts.loading,
    loaded: state.posts.loaded,
    isEnd : state.posts.isEnd,
    locationId : state.posts.locationId,
    deleteFeedback : state.posts.deleteFeedback,
    user: state.auth.user,
    arrowDisplayed : state.posts.arrowDisplay,
  }),
  {onOpenDialog, onCloseDialog, onStartEdit, onSetColumn, onDeletePost,
    onDisableAppend, onGetPostList, onLocationChange, onAppendList, onClearDeleteFeedback
    ,displayArrow, hideArrow}
)
export default class List extends Component {
  static propTypes = {
    posts : PropTypes.array,
    popover : PropTypes.bool,
    myPost : PropTypes.object,
    column : PropTypes.number,
    error: PropTypes.string,
    isEnd : PropTypes.bool,
    loading: PropTypes.bool,
    loaded :PropTypes.bool,
    locationId : PropTypes.number,
    deleteFeedback : PropTypes.string,
    //from parent
    user : PropTypes.object,

    onOpenDialog : PropTypes.func.isRequired,
    onCloseDialog : PropTypes.func.isRequired,
    onStartEdit :PropTypes.func.isRequired,
    onSetColumn : PropTypes.func.isRequired,
    onDeletePost: PropTypes.func.isRequired,

    onDisableAppend : PropTypes.func.isRequired,
    onGetPostList: PropTypes.func.isRequired,
    onLocationChange: PropTypes.func.isRequired,
    onAppendList : PropTypes.func.isRequired,
    onClearDeleteFeedback : PropTypes.func.isRequired,
    displayArrow :PropTypes.func.isRequired,
    hideArrow : PropTypes.func.isRequired,
  };

  handleResize = (event) => {
    if(window.innerWidth <= 600){
      if(this.props.column !== 1)
      //console.log( 'window inner width is', window.innerWidth, 'now set column to 1');
        this.props.onSetColumn(1)
    }else if(window.innerWidth <= 1200){
      if(this.props.column !== 2)
      //console.log( 'window inner width is', window.innerWidth, 'now set column to 2');
        this.props.onSetColumn(2)
    }else if(window.innerWidth <= 1800){
      if(this.props.column !== 3)
      //console.log( 'window inner width is', window.innerWidth, 'now set column to 3');
        this.props.onSetColumn(3)
    }else if(window.innerWidth <= 2400){
      if(this.props.column !== 4)
      //console.log( 'window inner width is', window.innerWidth, 'now set column to 4');
        this.props.onSetColumn(4)
    }
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = (event) => {
    var listBody = event.srcElement.body;

    if(window.innerHeight + document.scrollingElement.scrollTop >= config.arrowDisplayHeight){
      if(!this.props.arrowDisplayed) this.props.displayArrow()
    }else{
      if(this.props.arrowDisplayed) this.props.hideArrow()
    }
    if(window.innerHeight + document.scrollingElement.scrollTop >= listBody.scrollHeight - 20){
      //temporary disable append util we get result
      if(!this.props.loading && !this.props.isEnd){
        this.props.onDisableAppend();
        //console.log('now appending to list')
        if(this.props.user) {
          this.props.onAppendList(this.props.locationId, cityList, this.props.posts.length, this.props.user._id);
        }else{
          this.props.onAppendList(this.props.locationId, cityList, this.props.posts.length, null);
        }
      }
    }
  }

  onUpArrowClick = (event) => {
    if(window){
      window.scrollTo(0 , 100);
    }
  }

  render(){
    require('../../theme/react-select.css')
    const margin = 3; //percent
    const marginPercentage = margin.toString() + "%"
    var tileWidth = (Math.floor(100 / this.props.column) - margin * 2).toString() + "%";
    const styles = require('./Posts.scss');
    const {onDeletePost, onOpenDialog, onCloseDialog, loading, deleteFeedback,
      onStartEdit, locationId, error} = this.props;
    const {posts, user} = this.props;

    const onCityChange =(selectObject)=>{
      console.log("select object is", selectObject)
      var value = selectObject !== null ? selectObject.value : null ;
      if(value === ""){
        value = null
      }
      //Change the List
      console.log('this location id is', this.props.locationId, 'and value is', value)
      if(this.props.locationId != value){
        this.props.onLocationChange(value);
        //console.log('now the value of select is',value)
        this.props.onGetPostList(value, cityList, this.props.user)
      }
    }

    const deletePost = (event) => {
      onCloseDialog(event);
      onDeletePost(this.props.user._id, this.props.myPost._id)
    }

    const onEditButton =() => {
      this.props.onStartEdit();
    }

    const renderIcon = (post) => {
      const iconStyle = {"color" : "black"}
      if(this.props.user && post.owner === this.props.user._id){
        return(
          <span className={styles.buttonGroup}>
            <LinkContainer to={`/posts/${post._id}`}>
              <IconButton iconClassName="fa fa-pencil" onClick={onEditButton} iconStyle={iconStyle}/>
            </LinkContainer>
            <IconButton iconClassName="fa fa-trash" onClick={onOpenDialog} iconStyle={iconStyle}/>
          </span>
        )
      }else{
        return
      }
    }

    const renderAddTile = () => {

      return this.props.myPost == null ?
        <GridTile
          className={styles.tile}
          key={this.props.user ? user._id : "newPost"}
          style={{
                "display" : "flex", "alignItems":"center", "justifyContent": "center",
               height: "300px", width : tileWidth, margin : marginPercentage}}
        >
          <LinkContainer to={'/submitPost'}>
            <div className={styles.addPost}>
              <div className={styles.addFont}>
                <i className="fa fa-5x fa-plus-circle"/>
              </div>
              <div>{strings.addPostHint}</div>
            </div>
          </LinkContainer>
        </GridTile>
        : renderPost(this.props.myPost, true)
    }

    const renderAddHint = () => (
      <GridTile
        className={styles.tile}
        key={"newPostHint"}
        style={{
                "display" : "flex", "alignItems":"center", "justifyContent": "center",
               height: "300px", width : tileWidth, margin : marginPercentage}}
      >
        <LinkContainer to={'/login'}>
          <div className={styles.addPost}>
            <div className={styles.addFont}>
              <i className="fa fa-5x fa-plus-circle"/>
            </div>
            <div>{strings.addPostHintNoAuth}</div>
          </div>
        </LinkContainer>
      </GridTile>
    )

    const renderClassName =(post) => {
      return post.images.length > 0 ? "fa fa-2x fa-picture-o " + styles.blue : "fa fa-2x fa-picture-o"
    }

    const renderPost = (post, isMyPost)=> {
      return <GridTile
        className={styles.tile}
        key={post._id}
        style={{
              "display" : "flex", "justifyContent": "center", "color" : "black",
              height: "300px", width : tileWidth, margin : marginPercentage}}
      >
        <LinkContainer to={`/posts/${post._id}`}>
          <div className={styles.tileMain}>
            <div className={styles.leftQuote}>
              <i className="fa fa-quote-left fa-2x"/>
            </div>
            <div className={styles.content}>
              {post.description}
            </div>
            <div className={styles.rightQuote}>
              <i className="fa fa-quote-right fa-2x"/>
            </div>
          </div>
        </LinkContainer>
        <div className={styles.title}>
          <div className={styles.titleText}>
            <div className={styles.main}>
              <i className={renderClassName(post)}/>&nbsp;&nbsp;{post.username}
            </div>
            <div className={styles.sub}>in {post.city}</div>
          </div>
          <div className={styles.titleIcon}>
            {isMyPost && renderIcon(post)}
          </div>
        </div>
      </GridTile>
    }

    const listNavClass = this.props.user ? styles.listNav : styles.listNavBeforeLogin;

    return (
      <div className={styles.posts}>
        <Helmet title="求房列表"/>
        <div className={listNavClass}>
          <div className={styles.select}>
            <Select
              name="selectPostCity"
              options={cityList}
              value={locationId === null ? "" : cityList[locationId].value}
              onChange={onCityChange}
              noResultsText={strings.selectNoResultsPost}
              placeholder={strings.selectPlaceholderPost}
            />
          </div>
        </div>
        <div className={styles.myList}>
          { this.props.user ? renderAddTile() : renderAddHint()}
          { posts.length ? posts.map((post, index) => (
            renderPost(post, false)
          )) :
            <div className={styles.noPost}>
              {strings.noPost}
            </div>
          }
        </div>


        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true">sorry</span>
          {' '}
          {error}
        </div>}

        {loading &&
        <div className={styles.loading}>
          <p className={styles.loadingText}> Loading Now</p>
          <p><i className="fa fa-spin fa-refresh fa-4x"/></p>
        </div>}
        {this.props.arrowDisplayed &&
        <div className={styles.upArrowContainer} onClick={this.onUpArrowClick}>
          <i className={"fa fa-arrow-up fa-2x " + styles.upArrow}/>
        </div>}

        <Dialog
          title="确认删除"
          actions={[
                <FlatButton
                  label="取消"
                  onClick={onCloseDialog}
                />,
                <FlatButton
                  label="删除"
                  onClick={deletePost}
                  labelStyle={uiStyles.dialogConfirmStyle}
                />,
              ]}
          modal={false}
          open={this.props.popover}
          onRequestClose={onCloseDialog}
        >
          确认要删除?
        </Dialog>

        <Snackbar
          open={deleteFeedback != null}
          message={ deleteFeedback != null ? deleteFeedback : ""}
          autoHideDuration={4000}
          bodyStyle={uiStyles.snackBarStyleBlue}
          onRequestClose={(reason) => {
            this.props.onClearDeleteFeedback()
          }}
        />
      </div>
    )
  }
}