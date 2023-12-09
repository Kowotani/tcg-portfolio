// ==========
// interfaces
// ==========

// MobileMode
export interface IMobileMode {
  isActive: boolean
}

// MobileModeContext
export interface IMobileModeContext {
  mobileMode: IMobileMode,
  setMobileMode: React.Dispatch<React.SetStateAction<IMobileMode>>
}