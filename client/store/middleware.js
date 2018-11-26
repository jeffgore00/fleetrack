import { STS_INITAL_REQ_REJECTED, STS_OVERRIDE_FAILED } from './index';

export const passwordPopup = store => next => action => {
  if (
    action.status === STS_INITAL_REQ_REJECTED ||
    action.status === STS_OVERRIDE_FAILED
  ) {
    const body = document.getElementsByTagName('body')[0];
    const popup = document.createElement('div');
    const input = document.createElement('input');
    popup.className = 'passInput';
    input.setAttribute('type', 'password');
    popup.appendChild(input);
    body.appendChild(popup);
  } else {
    return next(action);
  }
};
