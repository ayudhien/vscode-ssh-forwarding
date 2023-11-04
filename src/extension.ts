'use strict';
import * as vscode from 'vscode';
import { SSHSocksProxy } from './sshSocksProxy';
import { SSHForwarding } from './sshForwarding';

export function activate(context: vscode.ExtensionContext) {

	new SSHForwarding(context);
	new SSHSocksProxy();
}

export function deactivate() {}
