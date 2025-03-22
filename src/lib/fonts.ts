import { Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';

// Main font - Neue Montreal
export const mainFont = localFont({
  src: [
    {
      path: '../../public/fonts/fonts/NeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/NeueMontreal-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-main',
  display: 'swap',
});

// Fancy font - Editorial New
export const fancyFont = localFont({
  src: [
    {
      path: '../../public/fonts/fonts/EditorialNew-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Ultralight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Ultrabold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/fonts/EditorialNew-Heavy.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-fancy',
  display: 'swap',
});

// Mono font for code, technical information
export const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Combining all font variables to use in layout
export const fontVariables = [
  mainFont.variable,
  fancyFont.variable, 
  monoFont.variable
].join(" ");
