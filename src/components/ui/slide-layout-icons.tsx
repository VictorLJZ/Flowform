import React from "react"
import { SlideLayoutType } from "@/types/layout-types"

interface LayoutIconProps {
  className?: string
}

// Mobile Layout Icons
export const MediaTopLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V9C12 9.55229 11.5523 10 11 10H1C0.447715 10 0 9.55229 0 9V2ZM2 16.25C2 15.8358 2.33579 15.5 2.75 15.5H7.25C7.66421 15.5 8 15.8358 8 16.25C8 16.6642 7.66421 17 7.25 17H2.75C2.33579 17 2 16.6642 2 16.25ZM2.75 12.5C2.33579 12.5 2 12.8358 2 13.25C2 13.6642 2.33579 14 2.75 14H9.25C9.66421 14 10 13.6642 10 13.25C10 12.8358 9.66421 12.5 9.25 12.5H2.75Z" fill="currentColor" />
  </svg>
)

export const MediaBottomLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none" className={className}>
    {/* Flipped version of the MediaTopLayoutIcon */}
    <path fillRule="evenodd" clipRule="evenodd" d="M0 18C0 19.1046 0.895431 20 2 20H10C11.1046 20 12 19.1046 12 18V11C12 10.4477 11.5523 10 11 10H1C0.447715 10 0 10.4477 0 11V18ZM2 3.75C2 4.16421 2.33579 4.5 2.75 4.5H7.25C7.66421 4.5 8 4.16421 8 3.75C8 3.33579 7.66421 3 7.25 3H2.75C2.33579 3 2 3.33579 2 3.75ZM2.75 7.5C2.33579 7.5 2 7.16421 2 6.75C2 6.33579 2.33579 6 2.75 6H9.25C9.66421 6 10 6.33579 10 6.75C10 7.16421 9.66421 7.5 9.25 7.5H2.75Z" fill="currentColor" />
  </svg>
)

export const MediaBetweenLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M1.75 4C1.33579 4 1 4.33579 1 4.75C1 5.16421 1.33579 5.5 1.75 5.5H8.25C8.66421 5.5 9 5.16421 9 4.75C9 4.33579 8.66421 4 8.25 4H1.75ZM1 8.5C1 7.67157 1.67157 7 2.5 7H9.5C10.3284 7 11 7.67157 11 8.5V11.5C11 12.3284 10.3284 13 9.5 13H2.5C1.67157 13 1 12.3284 1 11.5V8.5ZM1 15.25C1 14.8358 1.33579 14.5 1.75 14.5H8.25C8.66421 14.5 9 14.8358 9 15.25C9 15.6642 8.66421 16 8.25 16H1.75C1.33579 16 1 15.6642 1 15.25Z" fill="currentColor" />
  </svg>
)

export const MobileBackgroundLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V18C12 19.1046 11.1046 20 10 20H2C0.895431 20 0 19.1046 0 18V2ZM2 11.75C2 11.3358 2.33579 11 2.75 11H7.25C7.66421 11 8 11.3358 8 11.75C8 12.1642 7.66421 12.5 7.25 12.5H2.75C2.33579 12.5 2 12.1642 2 11.75ZM2.75 8C2.33579 8 2 8.33579 2 8.75C2 9.16421 2.33579 9.5 2.75 9.5H9.25C9.66421 9.5 10 9.16421 10 8.75C10 8.33579 9.66421 8 9.25 8H2.75Z" fill="currentColor" />
  </svg>
)

export const StandardLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.75 3C6.33579 3 6 3.33579 6 3.75C6 4.16421 6.33579 4.5 6.75 4.5H15.25C15.6642 4.5 16 4.16421 16 3.75C16 3.33579 15.6642 3 15.25 3H6.75ZM6 8C6 6.89543 6.89543 6 8 6H20C21.1046 6 22 6.89543 22 8V12C22 13.1046 21.1046 14 20 14H8C6.89543 14 6 13.1046 6 12V8ZM6 16.25C6 15.8358 6.33579 15.5 6.75 15.5H13.25C13.6642 15.5 14 15.8358 14 16.25C14 16.6642 13.6642 17 13.25 17H6.75C6.33579 17 6 16.6642 6 16.25Z" fill="currentColor" />
  </svg>
)

export const MediaRightLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path d="M15 8C15 6.89543 15.8954 6 17 6H23C24.1046 6 25 6.89543 25 8V12C25 13.1046 24.1046 14 23 14H17C15.8954 14 15 13.1046 15 12V8Z" fill="currentColor" />
    <path d="M3 11.75C3 11.3358 3.33579 11 3.75 11H8.25C8.66421 11 9 11.3358 9 11.75C9 12.1642 8.66421 12.5 8.25 12.5H3.75C3.33579 12.5 3 12.1642 3 11.75Z" fill="currentColor" />
    <path d="M3.75 8C3.33579 8 3 8.33579 3 8.75C3 9.16421 3.33579 9.5 3.75 9.5H10.25C10.6642 9.5 11 9.16421 11 8.75C11 8.33579 10.6642 8 10.25 8H3.75Z" fill="currentColor" />
  </svg>
)

export const MediaLeftLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path d="M3 8C3 6.89543 3.89543 6 5 6H11C12.1046 6 13 6.89543 13 8V12C13 13.1046 12.1046 14 11 14H5C3.89543 14 3 13.1046 3 12V8Z" fill="currentColor" />
    <path d="M16 11.75C16 11.3358 16.3358 11 16.75 11H21.25C21.6642 11 22 11.3358 22 11.75C22 12.1642 21.6642 12.5 21.25 12.5H16.75C16.3358 12.5 16 12.1642 16 11.75Z" fill="currentColor" />
    <path d="M16.75 8C16.3358 8 16 8.33579 16 8.75C16 9.16421 16.3358 9.5 16.75 9.5H23.25C23.6642 9.5 24 9.16421 24 8.75C24 8.33579 23.6642 8 23.25 8H16.75Z" fill="currentColor" />
  </svg>
)

export const MediaRightSplitLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M14 1C14 0.447715 14.4477 0 15 0H26C27.1046 0 28 0.895431 28 2V18C28 19.1046 27.1046 20 26 20H15C14.4477 20 14 19.5523 14 19V1ZM3 11.75C3 11.3358 3.33579 11 3.75 11H8.25C8.66421 11 9 11.3358 9 11.75C9 12.1642 8.66421 12.5 8.25 12.5H3.75C3.33579 12.5 3 12.1642 3 11.75ZM3.75 8C3.33579 8 3 8.33579 3 8.75C3 9.16421 3.33579 9.5 3.75 9.5H10.25C10.6642 9.5 11 9.16421 11 8.75C11 8.33579 10.6642 8 10.25 8H3.75Z" fill="currentColor" />
  </svg>
)

export const MediaLeftSplitLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H13C13.5523 0 14 0.447716 14 1V19C14 19.5523 13.5523 20 13 20H2C0.895431 20 0 19.1046 0 18V2ZM17 11.75C17 11.3358 17.3358 11 17.75 11H22.25C22.6642 11 23 11.3358 23 11.75C23 12.1642 22.6642 12.5 22.25 12.5H17.75C17.3358 12.5 17 12.1642 17 11.75ZM17.75 8C17.3358 8 17 8.33579 17 8.75C17 9.16421 17.3358 9.5 17.75 9.5H24.25C24.6642 9.5 25 9.16421 25 8.75C25 8.33579 24.6642 8 24.25 8H17.75Z" fill="currentColor" />
  </svg>
)

export const MediaBackgroundLayoutIcon: React.FC<LayoutIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H26C27.1046 0 28 0.895431 28 2V18C28 19.1046 27.1046 20 26 20H2C0.895431 20 0 19.1046 0 18V2ZM6 11.75C6 11.3358 6.33579 11 6.75 11H17.25C17.6642 11 18 11.3358 18 11.75C18 12.1642 17.6642 12.5 17.25 12.5H6.75C6.33579 12.5 6 12.1642 6 11.75ZM6.75 7C6.33579 7 6 7.33579 6 7.75C6 8.16421 6.33579 8.5 6.75 8.5H21.25C21.6642 8.5 22 8.16421 22 7.75C22 7.33579 21.6642 7 21.25 7H6.75Z" fill="currentColor" />
  </svg>
)

export const getLayoutIcon = (type: SlideLayoutType): React.FC<LayoutIconProps> => {
  switch (type) {
    case 'media-right':
      return MediaRightLayoutIcon
    case 'media-left':
      return MediaLeftLayoutIcon
    case 'media-right-split':
      return MediaRightSplitLayoutIcon
    case 'media-left-split':
      return MediaLeftSplitLayoutIcon
    case 'media-background':
      return MediaBackgroundLayoutIcon
    // Mobile layout icons
    case 'media-top':
      return MediaTopLayoutIcon
    case 'media-bottom':
      return MediaBottomLayoutIcon
    case 'media-between':
      return MediaBetweenLayoutIcon
    default:
      return StandardLayoutIcon
  }
}
