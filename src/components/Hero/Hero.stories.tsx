import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onStartJourney: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {};

/** Narrow viewport: hamburger toggle and slide-in menu panel. */
export const Mobile: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
};
