import {app} from 'electron'

export default class FrameworkApplicationImpl {

  public exit(exitCode: number = 0): void {
    console.log('被调用了！！！')
    app.exit(exitCode)
  }
}