import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routerStateReducer } from 'redux-router';

import auth from './modules/auth';
import counter from './modules/counter';
import {reducer as form} from 'redux-form';
import info from './modules/info';
import widgets from './modules/widgets';
import entities from './modules/entities';
import entity from './modules/entity'
import submit from './modules/submit'

export default combineReducers({
  router: routerStateReducer,
  auth,
  form,
  multireducer: multireducer({
    counter1: counter,
    counter2: counter,
    counter3: counter
  }),
  info,
  widgets,
  entities,
  entity,
  submit,
});
