import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'padded',
    options: {
      storySort: {
        order: ['Overview', 'Components'],
      },
    },
  },
};

export default preview;
