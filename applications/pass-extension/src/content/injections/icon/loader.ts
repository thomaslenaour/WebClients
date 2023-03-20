import uniqid from 'uniqid';

import { createElement } from '@proton/pass/utils/dom';

import { ICON_CIRCLE_LOADER, ICON_ROOT_CLASSNAME } from '../../constants';

import './icon.injection.scss';

/** Recreates the DOM structure of CircleLoader.tsx */
export const createCircleLoader = (): HTMLDivElement => {
    const uuid = uniqid();
    const svgNS = 'http://www.w3.org/2000/svg';
    const loader = createElement<HTMLDivElement>({
        type: 'div',
        classNames: [ICON_ROOT_CLASSNAME, ICON_CIRCLE_LOADER],
    });
    const svg = document.createElementNS(svgNS, 'svg');
    const defs = document.createElementNS(svgNS, 'defs');
    const circle = document.createElementNS(svgNS, 'circle');
    const useTrack = document.createElementNS(svgNS, 'use');
    const useCircle = document.createElementNS(svgNS, 'use');

    svg.setAttribute('viewBox', '0 0 16 16');
    svg.classList.add('circle-loader');

    circle.setAttribute('id', uuid);
    circle.setAttribute('cx', '8');
    circle.setAttribute('cy', '8');
    circle.setAttribute('r', '7');

    useTrack.setAttribute('href', `#${uuid}`);
    useTrack.classList.add('circle-loader-track');

    useCircle.setAttribute('href', `#${uuid}`);
    useCircle.classList.add('circle-loader-circle');

    defs.appendChild(circle);
    svg.appendChild(defs);
    svg.appendChild(useTrack);
    svg.appendChild(useCircle);
    loader.appendChild(svg);

    return loader;
};
