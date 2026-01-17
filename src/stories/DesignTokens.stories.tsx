import type { Meta, StoryObj } from '@storybook/react';
import { palette, colors, fonts, fontSizes, spacing, radii, shadows, tileSizes } from '../styles/tokens';
import '../index.css';

/**
 * Design Tokens Documentation
 * 
 * Single source of truth for all visual styling in Plante.
 * Uses the PICO-8 16-color palette for pixel-art consistency.
 */
const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Design tokens for the Plante pixel-art UI. All colors, fonts, and spacing values are defined here.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Color swatch component
const ColorSwatch = ({ name, hex }: { name: string; hex: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
    <div
      style={{
        width: '48px',
        height: '48px',
        backgroundColor: hex,
        border: '4px solid #5F574F',
        imageRendering: 'pixelated',
      }}
    />
    <div>
      <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#FFF1E8' }}>{name}</div>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#C2C3C7' }}>{hex}</div>
    </div>
  </div>
);

// Palette Story
export const Palette: Story = {
  name: 'Color Palette (PICO-8)',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        PICO-8 Palette
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {Object.entries(palette).map(([name, hex]) => (
          <ColorSwatch key={name} name={name} hex={hex} />
        ))}
      </div>
    </div>
  ),
};

// Semantic Colors Story
export const SemanticColors: Story = {
  name: 'Semantic Colors',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Semantic Colors
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {Object.entries(colors).map(([name, hex]) => (
          <ColorSwatch key={name} name={name} hex={hex} />
        ))}
      </div>
    </div>
  ),
};

// Typography Story
export const Typography: Story = {
  name: 'Typography',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Typography
      </h2>
      
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#29ADFF', marginBottom: '16px' }}>
          Game Font (Press Start 2P)
        </h3>
        <p style={{ fontFamily: fonts.game, fontSize: '24px', color: '#FFF1E8', marginBottom: '8px' }}>
          PLANTE
        </p>
        <p style={{ fontFamily: fonts.game, fontSize: '16px', color: '#FFF1E8', marginBottom: '8px' }}>
          Pixel Perfect
        </p>
        <p style={{ fontFamily: fonts.game, fontSize: '10px', color: '#FFF1E8' }}>
          Small game text
        </p>
      </div>

      <div>
        <h3 style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#29ADFF', marginBottom: '16px' }}>
          UI Font (System)
        </h3>
        <p style={{ fontFamily: fonts.ui, fontSize: '16px', color: '#FFF1E8', marginBottom: '8px' }}>
          Body text for readable content
        </p>
        <p style={{ fontFamily: fonts.ui, fontSize: '14px', color: '#C2C3C7' }}>
          Secondary text with muted color
        </p>
      </div>
    </div>
  ),
};

// Font Sizes Story
export const FontSizes: Story = {
  name: 'Font Sizes',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Font Sizes
      </h2>
      {Object.entries(fontSizes).map(([name, size]) => (
        <div key={name} style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#83769C', width: '60px' }}>
            {name}
          </span>
          <span style={{ fontFamily: 'Press Start 2P', fontSize: size, color: '#FFF1E8' }}>
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

// Spacing Story
export const Spacing: Story = {
  name: 'Spacing Scale',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Spacing Scale (8px base)
      </h2>
      {Object.entries(spacing).filter(([key]) => key !== 'px' && key !== '0').map(([name, size]) => (
        <div key={name} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#83769C', width: '40px' }}>
            {name}
          </span>
          <div
            style={{
              width: size,
              height: '16px',
              backgroundColor: '#29ADFF',
              border: '2px solid #1D2B53',
            }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#C2C3C7' }}>
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

// Border Radii Story
export const BorderRadii: Story = {
  name: 'Border Radii',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Border Radii (Pixel-friendly)
      </h2>
      <div style={{ display: 'flex', gap: '24px' }}>
        {Object.entries(radii).map(([name, radius]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#008751',
                border: '4px solid #5F574F',
                borderRadius: radius,
                marginBottom: '8px',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#C2C3C7' }}>
              {name}: {radius}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// Shadows Story
export const Shadows: Story = {
  name: 'Shadows',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Pixel Shadows
      </h2>
      <div style={{ display: 'flex', gap: '32px' }}>
        {Object.entries(shadows).map(([name, shadow]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#1D2B53',
                border: '4px solid #5F574F',
                boxShadow: shadow,
                marginBottom: '12px',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#C2C3C7' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// Tile Sizes Story
export const TileSizes: Story = {
  name: 'Tile Sizes',
  render: () => (
    <div style={{ backgroundColor: '#000', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#FFEC27', marginBottom: '24px' }}>
        Sprite Tile Sizes
      </h2>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
        {Object.entries(tileSizes).map(([name, size]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: '#7E2553',
                border: '2px solid #FF77A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#FFF1E8' }}>
                {size}
              </span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#C2C3C7' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
