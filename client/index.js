import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';
import { MIN_WINDOW_WIDTH } from './constants';
import _ from 'lodash';
import '@babel/polyfill';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

const loadGraph = () => {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
};

if (window.innerWidth < MIN_WINDOW_WIDTH) {
  header.style.display = 'none';
  splash.style.display = 'inline';
} else {
  loadGraph();
}
