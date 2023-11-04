# VSCOde extension for SSH Forwarding

**SSH Local Forwarding: Secure and Efficient Tunneling**

SSH Local Forwarding is a robust networking technique that empowers you to establish a secure tunnel from your local machine to a remote server using SSH (Secure Shell). This tunneling mechanism provides a means to securely access services and resources on the remote server as if they were located on your local system. It's a versatile tool that significantly enhances security and simplifies remote access to applications like web servers and databases, offering a safeguarded and encrypted connection for data transmission. SSH Local Forwarding is an indispensable feature of SSH, essential for network administrators, developers, and anyone in need of establishing secure connections between local and remote systems.

## Features

- **Secure Tunneling**: Establish encrypted tunnels for transmitting data between your local machine and a remote server, protecting your information from potential threats.
- **Remote Access**: Gain secure access to remote resources, services, and applications, as if they were running locally on your machine.
- **Simplified Configuration**: Configure SSH Local Forwarding easily using a straightforward JSON format.

## Configuration

### SSHForwarding Configuration Format

```json
"sshforwarding.connection": [
    {
        "name": "mongodb",
        "user": "root",
        "host": "localhost",
        "port": 22,
        "localbind": {
            "address": "localhost",
            "port": 27017
        },
        "remotebind": {
            "address": "localhost",
            "port": 27017
        },
        "keyfile": "~/.ssh/id_rsa"
    }
]
```

- **name**: A user-defined name for your SSH forwarding configuration.
- **user**: The SSH username for the remote server.
- **host**: The hostname or IP address of the remote server.
- **port**: The SSH port on the remote server (usually 22).
- **localbind**: Local address and port for binding.
- **remotebind**: Remote address and port for binding.
- **keyfile**: The path to your SSH key file.

### SSHSocksProxy Configuration Format

```json
"sshsocksproxy.connection": [
    {
        "name": "PROXY name",
        "user": "root",
        "host": "localhost",
        "port": 22,
        "localbind": {
            "address": "localhost",
            "port": 8080
        },
        "keyfile": "~/.ssh/id_rsa"
    }
]
```

- **name**: A user-defined name for your SSH SOCKS proxy configuration.
- **user**: The SSH username for the remote server.
- **host**: The hostname or IP address of the remote server.
- **port**: The SSH port on the remote server (usually 22).
- **localbind**: Local address and port for binding.
- **keyfile**: The path to your SSH key file.

## Getting Started

1. Clone this repository to your local machine.
2. Configure your SSH forwarding or SOCKS proxy settings in the provided JSON format.
3. Start the SSH tunneling using your preferred SSH client.

## Contributions

Contributions are welcome! Feel free to submit bug reports, feature requests, or pull requests to help improve this project.

## License

This project is licensed under the [MIT License](LICENSE).


---

We hope that this SSH Local Forwarding project simplifies your secure networking needs. If you have any questions or encounter issues, please don't hesitate to reach out. Thank you for using SSH Local Forwarding!