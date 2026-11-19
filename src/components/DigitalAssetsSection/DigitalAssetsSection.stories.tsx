import type { Meta, StoryObj } from '@storybook/react-vite';
import { DigitalAssetsSection } from './DigitalAssetsSection';

const meta: Meta<typeof DigitalAssetsSection> = {
  title: 'Components/DigitalAssetsSection',
  component: DigitalAssetsSection,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    heading: { control: 'text' },
    intro: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DigitalAssetsSection>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    heading: 'What your agents build from',
    intro: 'Rules, specs and skills live in the repo, so every agent starts from the same place.',
  },
};
