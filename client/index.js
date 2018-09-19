import store, { fetchInitialFleet } from './store';
import { addFunctionalityToButtons } from './menu/selectionButtons';

const header = document.querySelector('header');
const splash = document.getElementById('mobileSplash');

if (window.innerWidth < 900) {
  header.style.display = 'none';
  splash.style.display = 'inline';
} else {
  loadGraph();
}

window.onresize = () => {
  if (header.style.display === 'none' && window.innerWidth >= 900) {
    header.style.display = 'inline';
    splash.style.display = 'none';
    loadGraph();
  }
};

function loadGraph() {
  addFunctionalityToButtons();
  store.dispatch(fetchInitialFleet('DAL'));
}
