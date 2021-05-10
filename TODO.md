## Architecture

- What's the best way to configure the expire time of the JWT?


## Database
The synchronize option automatically syncs the schema database, if a change is made without concious this can lead to loss of data, refer to:

https://medium.com/@dltlabs/how-to-use-typeorm-to-sync-postgres-schema-8222736a632e#:~:text=The%20option%20%E2%80%9Csynchronize%3A%20true%E2%80%9D,to%20loss%20of%20existing%20data.

### Conections using multiple databases
*Notes:*
When using multiple connections you should set the name of the connection when an Injection of a Repository is required (usually this is done in the SERVICE)

Posible useful links:
- https://stackoverflow.com/questions/59638438/nestjs-typeorm-connecting-to-multiple-databases-connectionnotfounderror

### Error related to JWT Strategy
It is not documented, but it seems that the PassportStrategy need a name in the extends section, aparently any string would work.

*Note: * However the same name must be used when a route needs to be protected using AuthGuards,
this way the proper authentication strategy is injected and the order of the Decorator must be specially setted, for the case of the UseGuards should be placed before the Crud decorator

### Error importing Strategy
The Strategy should be imported from passport-jwt or passport-local


### YADAS Pure SQL
A function was created in order to extract the first word
https://stackoverflow.com/questions/707610/extract-the-first-word-of-a-string-in-a-sql-server-query

### Pseudo schematics
nest g module modules/ELEMENT &&
nest g controller modules/ELEMENT &&
nest g service modules/ELEMENT &&
mkdir src/modules/ELEMENT/dto &&
touch src/modules/ELEMENT/ELEMENT.entity.ts &&
touch src/modules/ELEMENT/ELEMENT.repository.ts

nest g module modules/inventory &&
nest g controller modules/inventory &&
nest g service modules/inventory &&
mkdir src/modules/inventory/dto &&
touch src/modules/inventory/inventory.entity.ts &&
touch src/modules/inventory/inventory.repository.ts

## Configuration of repo
The .env should be removed and added to the .gitignore files and the
configuration for different environments should be set

## Check local ENV
The current way of reading env variablesis not working for the local env
production values are being hardcoded y the production.yml file