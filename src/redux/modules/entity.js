/**
 * Created by hanwencheng on 1/9/16.
 */
var update = require('react-addons-update');

const LOAD = 'Nevermind/entity/LOAD';
const LOAD_SUCCESS = 'Nevermind/entity/LOAD_SUCCESS';
const LOAD_FAIL = 'Nevermind/entity/LOAD_FAIL';
const SUBMIT = 'Nevermind/entity/SUBMIT';
const SUBMIT_SUCCESS = 'Nevermind/entity/SUBMIT_SUCCESS';
const SUBMIT_FAIL = 'Nevermind/entity/SUBMIT_FAIL';
const CLEAR = 'Nevermind/entity/CLEAR'
const OPEN_CONTACT = "Nevermind/entity/OPEN_CONTACT";
const CLOSE_CONTACT = "Nevermind/entity/CLOSE_CONTACT";
const START_EDIT = "Nevermind/entity/START_EDIT";
const END_EDIT = "Nevermind/entity/END_EDIT";
const CACHE_DATA = "Nevermind/entity/CACHE_DATA";
const ADD_IMAGE = "Nevermind/entity/ADD_IMAGE";
const DELETE_IMAGE = "Nevermind/entity/DELETE_IMAGE";
const CHANGE_SLIDE = "Nevermind/entity/CHANGE_SLIDE";
const SUBMIT_NEW_SUCCESS = "Nevermind/entity/SUBMIT_NEW_SUCCESS";
const CLEAR_MESSAGE = "Nevermind/entity/CLEAR_MESSAGE"

const initState = {
  loaded: false,
  saveError: {},
  editing : false,
  contactOpen : false,
  data : {
    city: "城市",//which should be a string
    type : 0,
    price: "价格",
    startDate : "",
    title : "标题",
    owner : "",

    location: "",
    roomNumber: "",
    size : "",
    caution: "",
    endDate : "",
    description: "",
    email : "",
    phone : "",
    note : "",
    maximumPerson : 0 ,
    images:["http://ecx.images-amazon.com/images/I/518zSqpmd4L._SY300_.jpg",
      "http://ecx.images-amazon.com/images/I/514Uh33v2BL._AC_UL115_.jpg"],
  },
  cachedImages:[],
  currentSlide: 0,
  feedback: null,
  createId: null,
};

export default function reducer(state = initState, action){
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        loadedId : action.result.id,
        data: update(state.data, {$merge : action.result}),
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: action.error
      };
    case SUBMIT:
      var cachedData = Object.assign({}, state.data);
      return {
        ...state,
        submitting : true,
        cached : cachedData,
        data : action.cached,
        editing : false,
        currentSlide : 0,
        feedback : "now submitting, please wait"
      }
    case SUBMIT_SUCCESS:
          //state.cachedImages.forEach(function(image){
          //  if(!image.pushed) {
          //    update(image, {$merge: {pushed : true}})
          //    cachedData.images.push(window.URL.createObjectURL(image))
          //  }
          //})
          return {
            ...state,
            submitting : false,
            //data : cachedData,
            cached : null,
            feedback : action.result.status,
          }
    case SUBMIT_NEW_SUCCESS:
      //only add a new createId property here
          return {
            ...state,
            submitting :false,
            //data : action.result.data,
            cached : null,
            feedback : "发布成功,ID是" + action.result.data.id,
            //this id should be a string
            createId : action.result.data.id,
            loaded: true,
            loading: false,
            loadedId: action.result.data.id,
            error : null,
          }
    case SUBMIT_FAIL:
      var originData = Object.assign({}, state.cached);
          return {
            ...state,
            submitting : false,
            data : originData,
            cached :null,
            feedback : action.error,
            // TODO this error is not used, or change to boolean?
            submitError : action.error,
            cachedImages : [],
          }
    case CLEAR:
      return initState;
    case CLEAR_MESSAGE:
          return {
            ...state,
            feedback : null
          }
    case CLOSE_CONTACT:
      return {
        ...state,
        contactOpen : false
      }
    case OPEN_CONTACT:
      return {
        ...state,
        contactOpen : true
      }
    case START_EDIT:
      return {
        ...state,
        editing : true
      }
    case END_EDIT:
      return {
        ...state,
        editing :false
      }
    case ADD_IMAGE:
      // once only one image as input
      const image = update(state.cachedImages, {$push: [action.image]})
      return {
        ...state,
        cachedImages: image,
      }
    case DELETE_IMAGE:
      // notice action.id is start from 0
      const lengthRemote = state.data.images.length;
      const lengthCached = state.cachedImages.length;
      if(action.id < lengthRemote){
        return update(state, {data: {images: {$splice: [[action.id, 1]]}}});
      }else if(action.id < lengthCached + lengthRemote){
        return update(state, {cachedImages : {$splice : [[action.id - lengthRemote , 1]]}})
      }
    case CHANGE_SLIDE:
          return {
            ...state,
            currentSlide : action.page,
          }
    default :
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.entity && globalState.entity.loaded;
}

export function onClear(){
  return {
    type: CLEAR
  }
}

export function onContactOpen(){
  return {
    type: OPEN_CONTACT
  }
}

export function onContactClose(){
  return {
    type : CLOSE_CONTACT
  }
}

export function onStartEdit(){
  return {
    type : START_EDIT
  }
}

export  function onEndEdit(){
  return {
    type : END_EDIT
  }
}

export function onAddImage(images){
  return {
    type : ADD_IMAGE,
    image : images[0],
  }
}

export function onDeleteImage(id){
  return {
    type : DELETE_IMAGE,
    id : id,
  }
}

export function onLoadInit(){
  return {
    type : LOAD_INIT,
  }
}

export function onSubmit(data, images){
  const submitData = {
    data : data,
    images : images,
  }
  console.log('submit object is', submitData )
  return {
    cached : data,
    types: [SUBMIT, SUBMIT_SUCCESS, SUBMIT_FAIL],
    promise: (client) => client.post('./submit', {
      data : submitData,
      files : images
    })
  }
}


export function onSubmitNew(data, images){
  const submitData = {
    data : data,
    images : images,
  }
  console.log('new submit object is', submitData )
  return {
    cached : data,
    types: [SUBMIT, SUBMIT_NEW_SUCCESS, SUBMIT_FAIL],
    promise: (client) => client.post('./submit', {
      data : submitData,
      files : images
    })
  }
}

export function onClearMessage(){
  return {
    type : CLEAR_MESSAGE
  }
}

export function onChangeSlide(page){
  return {
    type: CHANGE_SLIDE,
    page: page,
  }
}

export function onLoad(number){
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => {
      const url = '/house/' + number
      console.log('request url is', url)
      return client.get(url)
    } // params not used, just shown as demonstration
  };
}