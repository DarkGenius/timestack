import { app, BrowserWindow, screen } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized?: boolean
}

export class WindowStateManager {
  private stateFilePath: string
  private state: WindowState

  constructor(windowName: string, defaults: { width: number; height: number }) {
    this.stateFilePath = path.join(app.getPath('userData'), `window-state-${windowName}.json`)
    this.state = this.loadState(defaults)
  }

  private loadState(defaults: { width: number; height: number }): WindowState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf8')
        return JSON.parse(data)
      }
    } catch (err) {
      console.error('Failed to load window state:', err)
    }
    return { ...defaults }
  }

  public saveState(window: BrowserWindow): void {
    try {
      const isMaximized = window.isMaximized()
      if (!window.isMinimized() && !isMaximized) {
        const bounds = window.getBounds()
        this.state = {
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
          isMaximized: false
        }
      } else {
        this.state.isMaximized = isMaximized
      }

      const dir = path.dirname(this.stateFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state), 'utf8')
    } catch (err) {
      console.error('Failed to save window state:', err)
    }
  }

  public getWindowState(): WindowState {
    const state = { ...this.state }

    // Validate that the window will be visible on some screen
    if (state.x !== undefined && state.y !== undefined) {
      const displays = screen.getAllDisplays()
      const isVisible = displays.some((display) => {
        const { x, y, width, height } = display.bounds
        return (
          state.x! >= x &&
          state.y! >= y &&
          state.x! + state.width <= x + width &&
          state.y! + state.height <= y + height
        )
      })

      if (!isVisible) {
        state.x = undefined
        state.y = undefined
      }
    }

    return state
  }
}
