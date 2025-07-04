/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as UnauthorizedImport } from './routes/unauthorized'
import { Route as PatientImport } from './routes/patient'
import { Route as IndexImport } from './routes/index'
import { Route as AdminIndexImport } from './routes/admin/index'
import { Route as AuthRegisterImport } from './routes/auth/register'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AdminStaffImport } from './routes/admin/staff'

// Create/Update Routes

const UnauthorizedRoute = UnauthorizedImport.update({
  id: '/unauthorized',
  path: '/unauthorized',
  getParentRoute: () => rootRoute,
} as any)

const PatientRoute = PatientImport.update({
  id: '/patient',
  path: '/patient',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AdminIndexRoute = AdminIndexImport.update({
  id: '/admin/',
  path: '/admin/',
  getParentRoute: () => rootRoute,
} as any)

const AuthRegisterRoute = AuthRegisterImport.update({
  id: '/auth/register',
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any)

const AdminStaffRoute = AdminStaffImport.update({
  id: '/admin/staff',
  path: '/admin/staff',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/patient': {
      id: '/patient'
      path: '/patient'
      fullPath: '/patient'
      preLoaderRoute: typeof PatientImport
      parentRoute: typeof rootRoute
    }
    '/unauthorized': {
      id: '/unauthorized'
      path: '/unauthorized'
      fullPath: '/unauthorized'
      preLoaderRoute: typeof UnauthorizedImport
      parentRoute: typeof rootRoute
    }
    '/admin/staff': {
      id: '/admin/staff'
      path: '/admin/staff'
      fullPath: '/admin/staff'
      preLoaderRoute: typeof AdminStaffImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    '/auth/register': {
      id: '/auth/register'
      path: '/auth/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterImport
      parentRoute: typeof rootRoute
    }
    '/admin/': {
      id: '/admin/'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/patient': typeof PatientRoute
  '/unauthorized': typeof UnauthorizedRoute
  '/admin/staff': typeof AdminStaffRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/admin': typeof AdminIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/patient': typeof PatientRoute
  '/unauthorized': typeof UnauthorizedRoute
  '/admin/staff': typeof AdminStaffRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/admin': typeof AdminIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/patient': typeof PatientRoute
  '/unauthorized': typeof UnauthorizedRoute
  '/admin/staff': typeof AdminStaffRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/admin/': typeof AdminIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/patient'
    | '/unauthorized'
    | '/admin/staff'
    | '/auth/login'
    | '/auth/register'
    | '/admin'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/patient'
    | '/unauthorized'
    | '/admin/staff'
    | '/auth/login'
    | '/auth/register'
    | '/admin'
  id:
    | '__root__'
    | '/'
    | '/patient'
    | '/unauthorized'
    | '/admin/staff'
    | '/auth/login'
    | '/auth/register'
    | '/admin/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  PatientRoute: typeof PatientRoute
  UnauthorizedRoute: typeof UnauthorizedRoute
  AdminStaffRoute: typeof AdminStaffRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthRegisterRoute: typeof AuthRegisterRoute
  AdminIndexRoute: typeof AdminIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  PatientRoute: PatientRoute,
  UnauthorizedRoute: UnauthorizedRoute,
  AdminStaffRoute: AdminStaffRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthRegisterRoute: AuthRegisterRoute,
  AdminIndexRoute: AdminIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/patient",
        "/unauthorized",
        "/admin/staff",
        "/auth/login",
        "/auth/register",
        "/admin/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/patient": {
      "filePath": "patient.tsx"
    },
    "/unauthorized": {
      "filePath": "unauthorized.tsx"
    },
    "/admin/staff": {
      "filePath": "admin/staff.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx"
    },
    "/admin/": {
      "filePath": "admin/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
