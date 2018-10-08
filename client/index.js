import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';
import { MIN_WINDOW_WIDTH } from './constants';
import _ from 'lodash';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

const loadGraph = () => {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
};

const loadGraphAfterResize = _.debounce(() => {
  loadGraph();
}, 1000);

header.style.display = 'none';
splash.style.display = 'inline';

/*
// Restore this after API issues fixed:
if (window.innerWidth < MIN_WINDOW_WIDTH) {
  header.style.display = 'none';
  splash.style.display = 'inline';
} else {
  loadGraph();
}

window.onresize = () => {
  if (
    header.style.display === 'none' &&
    window.innerWidth >= MIN_WINDOW_WIDTH
  ) {
    header.style.display = 'inline';
    splash.style.display = 'none';
    loadGraphAfterResize();
  }
};
*/
