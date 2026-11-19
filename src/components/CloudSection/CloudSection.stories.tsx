import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloudSection } from './CloudSection';

const meta: Meta<typeof CloudSection> = {
  title: 'Components/CloudSection',
  component: CloudSection,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CloudSection>;

export const Default: Story = {};
