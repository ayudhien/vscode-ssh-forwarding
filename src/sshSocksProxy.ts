'use strict';
import * as vscode from 'vscode';
import { socksproxy } from './config';
import socks from 'socksv5';
import { Client } from 'ssh2';

export class SSHSocksProxy {
    constructor() {
        const sshSocksProxyProvider = new SSHSocksProxyProvider();
		vscode.window.registerTreeDataProvider('sshSocksProxy', sshSocksProxyProvider);
		vscode.commands.registerCommand('sshSocksProxy.refreshEntry', () => sshSocksProxyProvider.refresh());
		vscode.commands.registerCommand('sshSocksProxy.connectionAction', (item) => sshSocksProxyProvider.connectionAction(item));
    }
}

export class SSHSocksProxyProvider implements vscode.TreeDataProvider<SSHSocksProxyProperties> {
    private _onDidChangeTreeData: vscode.EventEmitter<SSHSocksProxyProperties | undefined> = new vscode.EventEmitter<SSHSocksProxyProperties | undefined>();
    readonly onDidChangeTreeData: vscode.Event<SSHSocksProxyProperties | undefined> = this._onDidChangeTreeData.event;
    connectedItems: SSHSocksProxyProperties[] = [];
    constructor() {
	}

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	async connectionAction(element: SSHSocksProxyProperties) {
        if (element.isConnect) {
            vscode.window.showInformationMessage("Trying to close connection for " + element.label + " ..."); 
			if (element.socks.connections.length > 0) {
				for (const connection of element.socks.connections) {
					connection.end();
				}
			}
			element.socks.close();
			element.socks.on('close', () => {
				element.isConnect = false;
				this.connectedItems = this.connectedItems.filter((item: any) => item.label !== element.label);        
				vscode.window.showInformationMessage("Close connection for " + element.label + " successfully!");    
				this._onDidChangeTreeData.fire(undefined);                    
				element.socks= null;
		   });
			
        }else{
			const sshConfig = {
				host: element.config.host,
				port: element.config.port,
				username: element.config.user,
				privateKey: require('fs').readFileSync(element.config.keyfile)
			};
			const socksConnection = socks.createServer((info: any, accept: any, deny: any) => {
				const conn = new Client();
				conn.on('ready', () => {
				  conn.forwardOut(info.srcAddr,
								  info.srcPort,
								  info.dstAddr,
								  info.dstPort,
								  (err, stream) => {
					if (err) {
					  conn.end();
					  return deny();
					}
					
					const clientSocket = accept(true);
					if (clientSocket) {
						element.socks.connections.push(clientSocket);
					  stream.pipe(clientSocket).pipe(stream).on('close', () => {
						conn.end();
					  });
					} else {
					  conn.end();
					}
				  });
				}).on('error', (err) => {
				  deny();
				}).connect(sshConfig);
			  }).listen(element.config.localbind.port, element.config.localbind.host, () => {
				element.socks = socksConnection;
				element.socks.connections = [];
				element.isConnect = true;
            	this.connectedItems.push(element);
            	vscode.window.showInformationMessage("SOCKSv5 proxy server " + element.label + " started on port "+ element.config.localbind.port +" successfully!");
				this._onDidChangeTreeData.fire(undefined);
			  }).useAuth(socks.auth.None()).
			  on('error', (err: any) => {
				element.isConnect = false;
                this.connectedItems = this.connectedItems.filter((item: any) => item.label !== element.label);
                vscode.window.showErrorMessage(element.label + " connection error : " + err.message); 
                this._onDidChangeTreeData.fire(undefined);        
			  });
			
        }
        
    }

	getTreeItem(element: SSHSocksProxyProperties): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<SSHSocksProxyProperties[]>{
        return Promise.resolve(this.getItems());
	}

	getItems(): SSHSocksProxyProperties[] {
        let config = vscode.workspace.getConfiguration('sshsocksproxy');
        const sockproxies: socksproxy[] = config.get<socksproxy[]>('connection') || [];
        let items: SSHSocksProxyProperties[] = [];
        for (let index = 0; index < sockproxies.length; index++) {
            const el = this.connectedItems.find((item: any) => item.label === sockproxies[index].name) ;
            const isConnected = el ? true : false;
            const item = new SSHSocksProxyProperties(sockproxies[index].name, `${sockproxies[index].localbind.host}:${sockproxies[index].localbind.port}`, isConnected, sockproxies[index]);
            if (el) {
                item.socks = el.socks;
            }
            item.iconPath = this.iconPath(isConnected);
            items[index] = item;
        }
		return items;
    }

	iconPath(isConnect: boolean): vscode.ThemeIcon {
        return new vscode.ThemeIcon('zap', new vscode.ThemeColor(isConnect ? 'debugIcon.startForeground': 'debugIcon.disconnectForeground'));
    }
}


export class SSHSocksProxyProperties extends vscode.TreeItem {

	constructor(
		public readonly label: string,
        public readonly description: string,
        public  isConnect: boolean,
        public config: socksproxy,
		private readonly version: string = ''
       
	) {
		super(label, vscode.TreeItemCollapsibleState.None);

		this.tooltip = this.isConnect ? 'Connected' : 'Disconnected';
	}

    socks: any;
	contextValue = 'socksProxyItem';
}
