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
   
4. Hook up tenants configuration into your main `nginx.conf`:

   ```
   include myapp/*.conf;
   ```

Tenants configurations submitted via API will be stored in
`<root>/<tenantId>.conf`.

## REST API

### GET /

List all known tenants.

### POST /:id

Creates or updates tenant with specified `id`. Accepts JSON body with Nginx
configuration as plain text.

### GET /:id

Returns Nginx configuration for specified tenant.

### DELETE /:id

Deletes tenant configuration.

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




