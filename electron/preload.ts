import {contextBridge, ipcRenderer} from 'electron'
import FrameworkApplicationImpl from './framework-impl/framework-application-impl.ts'

function register(tag: string, impl: any) {
  const result: any = {}
  const resultContainer: any = {}
  Object.getOwnPropertyNames(impl.prototype).forEach((key) => {
    result[key] = (...args: any) => ipcRenderer.invoke(tag + '.' + key, {...args})
  })
  resultContainer[tag] = result
  return resultContainer
}

contextBridge.exposeInMainWorld('lemon', {
  ...register('application', FrameworkApplicationImpl)
})