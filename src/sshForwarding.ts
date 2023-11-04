'use strict';
import * as vscode from 'vscode';
import *  as fs from 'fs';
import {connection} from './config';
import {createTunnel} from 'tunnel-ssh';


export class SSHForwarding {
    constructor(context: vscode.ExtensionContext) {
        const sshForwardingProvider = new SSHForwardingProvider(context);
        vscode.window.registerTreeDataProvider('sshForwarding', sshForwardingProvider);
        vscode.commands.registerCommand('sshForwarding.refreshEntry', () => sshForwardingProvider.refresh());
        vscode.commands.registerCommand('sshForwarding.connectionAction', (item ) => sshForwardingProvider.connectionAction(item));
    }
}

export class SSHForwardingProvider implements vscode.TreeDataProvider<SSHForwardingProperties> {
    private _context: vscode.ExtensionContext;
    private _onDidChangeTreeData: vscode.EventEmitter<SSHForwardingProperties | undefined> = new vscode.EventEmitter<SSHForwardingProperties | undefined>();
    readonly onDidChangeTreeData: vscode.Event<SSHForwardingProperties | undefined> = this._onDidChangeTreeData.event;
    connectedItems: SSHForwardingProperties[] = [];
    constructor(context: vscode.ExtensionContext) {
        this._context = context;
	}

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}


    async connectionAction(element: SSHForwardingProperties) {
        if (element.isConnect) {
            vscode.window.showInformationMessage("Trying to close connection for " + element.label + " ..."); 
            if (element.tunnel.conn) {
                await element.tunnel.conn.end();
            }
            element.tunnel.close(); 
            element.tunnel.on('close', () => {
                element.isConnect = false;
                this.connectedItems = this.connectedItems.filter((item: any) => item.label !== element.label);        
                vscode.window.showInformationMessage("Close connection for " + element.label + " successfully!");    
                this._onDidChangeTreeData.fire(undefined);                    
                element.tunnel= null;
           });

        }else{
            const [server, conn] = await this.getSSHConnection(element.config);
            conn.on('error', (err: any) => {
                element.isConnect = false;
                this.connectedItems = this.connectedItems.filter((item: any) => item.label !== element.label);
                vscode.window.showErrorMessage(element.label + " connection error : " + err.message); 
                this._onDidChangeTreeData.fire(undefined);
            });
            server.on('error', (err: any) => {
                element.isConnect = false;
                this.connectedItems = this.connectedItems.filter((item: any) => item.label !== element.label);
                vscode.window.showErrorMessage(element.label + " connection error : " + err.message); 
                this._onDidChangeTreeData.fire(undefined);        
            });
            
            
            
            element.tunnel = server;
            element.tunnel.conn = conn;
            element.isConnect = true;
            this.connectedItems.push(element);
            vscode.window.showInformationMessage("Open connection for " + element.label + " successfully!");
        }
        this._onDidChangeTreeData.fire(undefined);
    }

	getTreeItem(element: SSHForwardingProperties): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<SSHForwardingProperties[]>{
        return Promise.resolve(this.getItems());
	}

    iconPath(isConnect: boolean): vscode.ThemeIcon {
        return new vscode.ThemeIcon('zap', new vscode.ThemeColor(isConnect ? 'debugIcon.startForeground': 'debugIcon.disconnectForeground'));
    }

    getItems(): SSHForwardingProperties[] {
        let config = vscode.workspace.getConfiguration('sshforwarding');
        const connections: connection[] = config.get<connection[]>('connection') || [];
        let items: SSHForwardingProperties[] = [];
        for (let index = 0; index < connections.length; index++) {
            const el = this.connectedItems.find((item: any) => item.label === connections[index].name) ;
            const isConnected = el ? true : false;
            const item = new SSHForwardingProperties(connections[index].name, `${connections[index].localbind.port}:${connections[index].remotebind.port}`, isConnected, connections[index]);
            if (el) {
                item.tunnel = el.tunnel;
            }
            item.iconPath = this.iconPath(isConnected);
            items[index] = item;
        }
		return items;
    }

    private getSSHConnection(config: connection): any {
        const sshOptions = {
            host: config.host,
            port: config.port,
            username: config.user,
            privateKey: fs.readFileSync(config.keyfile)
        };

        let forwardOptions = {
            srcAddr:config.localbind.host,
            srcPort: config.localbind.port,
            dstAddr: config.remotebind.host,
            dstPort: config.remotebind.port
        };
        let tunnelOptions = {
            autoClose: false
        };
        let serverOptions = {
            port: config.localbind.port
        };
        return createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
    }
}


export class SSHForwardingProperties extends vscode.TreeItem {
	constructor(
		public readonly label: string,
        public readonly description: string,
        public  isConnect: boolean,
        public config: connection,
		private readonly version: string = ''
       
	) {
		super(label, vscode.TreeItemCollapsibleState.None);

		this.tooltip = this.isConnect ? 'Connected' : 'Disconnected';
	}

	contextValue = 'sshForwardingItem';
    tunnel: any;
}
