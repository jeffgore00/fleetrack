import {
  DATA_MARGIN_TOP,
  DATA_MARGIN_RIGHT,
  DATA_MARGIN_BOTTOM,
  DATA_MARGIN_LEFT,
  DATA_TO_CONTENT_PROPORTION
} from '../constants';

export const margin = {
  top: DATA_MARGIN_TOP,
  right: DATA_MARGIN_RIGHT,
  bottom: DATA_MARGIN_BOTTOM,
  left: DATA_MARGIN_LEFT
};

let window;
let document;

if (process.env.NODE_ENV === 'testing') {
  let MockBrowser = require('mock-browser').mocks.MockBrowser;
  let mock = new MockBrowser();
  document = mock.getDocument();
  window = mock.getWindow();
}

export const computeDataHeight = () =>
  window.innerHeight * DATA_TO_CONTENT_PROPORTION - margin.top - margin.bottom;

export const computeDataWidth = () =>
  window.innerWidth * DATA_TO_CONTENT_PROPORTION - margin.left - margin.right;
