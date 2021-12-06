import { IMAGE_PROXY_FLAGS, SHOW_IMAGES } from '@proton/shared/lib/constants';
import { Message } from '@proton/shared/lib/interfaces/mail/Message';
import { fireEvent } from '@testing-library/dom';
import { createDocument } from '../../../helpers/test/message';
import { defaultProps, initMessage, setup } from './Message.test.helpers';
import { addToCache, minimalCache, addApiMock, clearAll, assertIcon } from '../../../helpers/test/helper';
import MessageView from '../MessageView';
import { MessageState } from '../../../logic/messages/messagesTypes';

jest.mock('../../../helpers/dom', () => {
    return { preloadImage: jest.fn(() => Promise.resolve()) };
});

describe('Message images', () => {
    afterEach(clearAll);

    it('should display all elements other than images', async () => {
        addToCache('MailSettings', { ShowImages: SHOW_IMAGES.NONE });

        const imageURL = 'imageURL';
        const content = `<div>
  <div>
    <table>
      <tbody>
        <tr>
          <td proton-background='${imageURL}' data-testid="image-background">Element</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div>
    <video proton-poster='${imageURL}' data-testid="image-poster">
      <source src="" type="video/mp4" />
    </video>
  </div>

  <div>
    <picture>
      <source media="(min-width:650px)" proton-srcset='${imageURL}' data-testid="image-srcset"/>
      <img src='${imageURL}' data-testid="image-srcset2"/>
    </picture>
  </div>

  <div>
    <svg width="50" height="50">
      <image proton-xlink:href='${imageURL}' data-testid="image-xlinkhref"/>
    </svg>
  </div>
</div>`;

        const document = createDocument(content);

        const message: MessageState = {
            localID: 'messageID',
            data: {
                ID: 'messageID',
            } as Message,
            messageDocument: { document },
            messageImages: {
                hasEmbeddedImages: false,
                hasRemoteImages: true,
                showRemoteImages: false,
                showEmbeddedImages: true,
                images: [],
            },
        };

        minimalCache();

        initMessage(message);

        const { getByTestId, rerender } = await setup({}, false);

        // Check that all elements are displayed in their proton attributes before loading them
        const elementBackground = getByTestId('image-background');
        expect(elementBackground.getAttribute('proton-background')).toEqual(imageURL);

        const elementPoster = getByTestId('image-poster');
        expect(elementPoster.getAttribute('proton-poster')).toEqual(imageURL);

        const elementSrcset = getByTestId('image-srcset');
        expect(elementSrcset.getAttribute('proton-srcset')).toEqual(imageURL);

        const elementXlinkhref = getByTestId('image-xlinkhref');
        expect(elementXlinkhref.getAttribute('proton-xlink:href')).toEqual(imageURL);

        const loadButton = getByTestId('remote-content:load');

        fireEvent.click(loadButton);

        // Rerender the message view to check that images have been loaded
        await rerender(<MessageView {...defaultProps} />);

        // Check that proton attribute has been removed after images loading
        const updatedElementBackground = getByTestId('image-background');
        expect(updatedElementBackground.getAttribute('background')).toEqual(imageURL);

        const updatedElementPoster = getByTestId('image-poster');
        expect(updatedElementPoster.getAttribute('poster')).toEqual(imageURL);

        const updatedElementSrcset = getByTestId('image-srcset');
        expect(updatedElementSrcset.getAttribute('srcset')).toEqual(imageURL);

        const updatedElementXlinkhref = getByTestId('image-xlinkhref');
        expect(updatedElementXlinkhref.getAttribute('xlink:href')).toEqual(imageURL);
    });

    it('should be able to load direct when proxy failed at loading', async () => {
        const imageURL = 'imageURL';
        const content = `<div><img proton-src="${imageURL}" data-testid="image"/></div>`;
        const document = createDocument(content);
        const message: MessageState = {
            localID: 'messageID',
            data: {
                ID: 'messageID',
            } as Message,
            messageDocument: { document },
            messageImages: {
                hasEmbeddedImages: false,
                hasRemoteImages: true,
                showRemoteImages: false,
                showEmbeddedImages: true,
                images: [],
            },
        };

        addApiMock(`images`, () => {
            const error = new Error();
            (error as any).data = { Code: 2902, Error: 'TEST error message' };
            return Promise.reject(error);
        });

        minimalCache();
        addToCache('MailSettings', { ShowImages: SHOW_IMAGES.NONE, ImageProxy: IMAGE_PROXY_FLAGS.PROXY });

        initMessage(message);

        const { getByTestId, getByText, rerender, container } = await setup({}, false);

        const image = await getByTestId('image');
        expect(image.getAttribute('proton-src')).toEqual(imageURL);

        let loadButton = getByTestId('remote-content:load');
        fireEvent.click(loadButton);

        // Rerender the message view to check that images have been loaded
        await rerender(<MessageView {...defaultProps} />);

        const placeholder = container.querySelector('.proton-image-placeholder') as HTMLImageElement;

        expect(placeholder).not.toBe(null);
        assertIcon(placeholder.querySelector('svg'), 'circle-xmark');

        getByText('Load unprotected', { exact: false });

        loadButton = getByTestId('remote-content:load');
        fireEvent.click(loadButton);

        // Rerender the message view to check that images have been loaded
        await rerender(<MessageView {...defaultProps} />);

        const loadedImage = container.querySelector('.proton-image-anchor img') as HTMLImageElement;
        expect(loadedImage).toBeDefined();
        expect(loadedImage.getAttribute('src')).toEqual(imageURL);
    });
});
