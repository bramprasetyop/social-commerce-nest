# SOCIAL COMMERCE NESTJS

## Introduction

This readme provides detailed instructions for setting up and running a NestJS application. Ensure that you have Node.js version 18 and above installed on your machine.

## Installation

To install the necessary dependencies, run the following command:

```bash
yarn install
```

## ENV File

For adding the environment file with dependencies, please copy from `.env.sample` to `.env`

## Run Locally

To run the NestJS application locally, execute the following command:

```bash
yarn run start:dev
```

This will start the development server, and your application will be accessible at: [localhost:3000](http://localhost:3000/) or you can modify it in `.env` file

## Run Using Docker Locally

- Run the following command to build and run the Docker container:

```bash
yarn run docker:dev
```

This command will build the Docker image and start the containerized application. Access your application at [localhost:3000](http://localhost:3000/) within the Docker environment.

Note: Ensure that Docker is installed on your machine before running the Docker commands.

## Swagger Documentation

Access application swagger at [localhost:3000/docs](http://localhost:3000/docs).

## Bull Queue Dashboard

Access dashboard for monitoring Queue process at [localhost:3000/queue-monitoring](http://localhost:3000/queue-monitoring).

## Database Migrations

```bash
npx sequelize-cli migration:generate --name your_migration_name
```

```bash
npx sequelize-cli db:migrate
```

## Database Seeder

```bash
npx sequelize-cli seed:generate --name your_migration_name
```

```bash
npx sequelize-cli db:seed
```

## Additional Information

Feel free to customize the application further based on your specific requirements. For more information about NestJS, refer to the [Official Documentation](https://nestjs.com/)
