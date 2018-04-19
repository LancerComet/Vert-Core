import Vue, { ComponentOptions } from 'vue'

import { globalInjector } from '../injection/data/internal-injectors'
import { THookFunction, TRootComponent, TService } from '../types'
import { TypeUtils } from '../utils/type-utils'

/**
 * App is the basic unit for a project.
 *
 * @description
 * Page is the root member for an app. Create an instance to initialize your app.
 *
 * @class App
 */
export class App<R = any, S = any> {
  static addSingleton <T> (Provider: new (...args) => T, instance: T) {
    globalInjector.set(Provider, instance)
  }

  private _element: string | HTMLElement
  private _name: string
  private _store: S
  private _router: R
  private _viewModel: Vue

  private _serviceInstances: {[srvName: string]: TService} = {}

  get name (): string { return this._name }
  get store () { return this._store }
  get viewModel (): Vue { return this._viewModel }

  private initViewModel (
    RootComponent: TRootComponent,
    created: THookFunction,
    mounted: THookFunction,
    beforeDestroy: THookFunction
  ) {
    const option: ComponentOptions<Vue> = {
      name: this.name,
      template: createViewModelTemplate(`${this.name}`),
      components: {
        'root-component': RootComponent
      },
      provide: this._serviceInstances,
      created () {
        TypeUtils.isFunction(created) && created(this)
      },
      mounted () {
        TypeUtils.isFunction(mounted) && mounted(this)
      },
      beforeDestroy () {
        TypeUtils.isFunction(beforeDestroy) && beforeDestroy(this)
      }
    }

    if (TypeUtils.isDefined(this._router)) {
      Object.assign(option, { router: this._router })
    }

    if (TypeUtils.isDefined(this._store)) {
      Object.assign(option, { store: this._store })
    }

    this._viewModel = new Vue(option)
  }

  /**
   * Start up this app.
   *
   * @memberof App
   */
  start () {
    this._viewModel.$mount(this._element)
  }

  constructor (option: IAppOption<R, S>) {
    option.services = option.services || []

    this._element = option.element
    this._name = option.name || 'default_app'
    this._router = option.router
    this._store = option.store

    this.initViewModel(
      option.rootComponent,
      option.created,
      option.mounted,
      option.beforeDestroy
    )
  }
}

/**
 * Constructor param of AppPage.
 *
 * @interface IAppPage
 */
export interface IAppOption<R = any, S = any> {
  element?: string | HTMLElement
  name?: string
  rootComponent: TRootComponent
  router?: R
  services?: TService[]
  store?: S

  created?: THookFunction
  mounted?: THookFunction
  beforeDestroy?: THookFunction
}

function createViewModelTemplate (id: string): string {
  return `
  <div id="${id}">
    <root-component></root-component>
  </div>
  `
}
