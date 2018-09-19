import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';
import { MIN_WINDOW_WIDTH } from './constants';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

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
    loadGraph();
  }
};

function loadGraph() {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
}
