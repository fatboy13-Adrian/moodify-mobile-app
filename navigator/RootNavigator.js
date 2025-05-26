// JavaScript for root navigator
// RootNavigator.js

import { createRef } from 'react';

export const navigationRef = createRef();

export function navigate(name, params) {
    navigate.current?.navigate(name, params);
}

export function navigateNested(routeName, nestedRoute, params) {
    navigationRef.current?.navigate(routeName, {
        screen: nestedRoute,
        params: params,
    });
}