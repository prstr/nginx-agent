# Nginx Management Agent

Tiny RESTful web server for dynamically managing Nginx configuration for
multi-tenant systems.

It is designed to run inside your trusted infrastructure
(e.g. binds to 127.0.0.1 or intranet), so no security is implemented.

In order to be able to reload nginx dynamically Nginx Agent should
be run with `sudo`.

## Installation

1. Install from npm:

    ```
    npm install -g nginx-agent
    ```

2. Create a directory for managing your Nginx tenants:

   ```
   mkdir -p /etc/nginx/conf/myapp
   ```
   
3. Run Nginx Agent there:

   ```
   nginx-agent
   ```
   
4. It will create `nginx.conf` there:

   ```
   include tenants/*/nginx.conf
   ```

5. Hook up this configuration into your main `nginx.conf`:

   ```
   include /etc/nginx/conf/myapp/nginx.conf;
   ```

## REST API

### GET /tenants

List all known tenants.

### POST /tenants/:id

Creates a tenant with specified `id`. Accepts JSON body which is converted
into Nginx configuration via [nginx-json](https://github.com/prstr/nginx-json).

### GET /tenants/:id

Returns Nginx configuration for specified tenant.

### DELETE /tenants/:id

Deletes tenant configuration.

### POST /reload

Issues `nginx reload` command and returns its result.

Note: Nginx Agent must be run under `sudo` in order for this to work.
If you'd rather not to sudo-run Node.js processes, you can, let's see here...
You can reload Nginx with Cron every minute :smile:

## Options

By default Nginx Agent starts with following options:

```js
{
  "port": 7390,
  "ip": "127.0.0.1",
  "password": null // no password required
}
```

It is advised that you create `nginx-agent.json` in working directory
and specify required parameters there.

## SSL support coming soon




