<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <img src="assets/Logo-vector.png" alt="Logo" width="600" height="250">


  <h2 align="center">ACME Ecommerce</h2>

  <p align="center">
    An e-commerce website.
    <br />
    <a href="https://www.youtube.com/watch?v=yCXuyqVTIFU">View Demo</a>
    <a href="https://e-comm-frontend-xi.vercel.app/>Visit website</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#author">Authors</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Our e-commerce app provides a seamless shopping experience, allowing users to browse a variety of products, add items to their cart, and securely complete purchases with Stripe payment integration. Built with robust backend management using NestJS and PostgreSQL and redis, it ensures efficient cart and order handling, user authentication, and smooth checkout processes.

### Built With

- Frontend
  - [Next.js](https://nextjs.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Shadcn UI](https://ui.shadcn.com/)
  - [Redux Toolkit](https://redux-toolkit.js.org/)
- Backend
  - [Nestjs](https://docs.nestjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Typeorm](https://typeorm.io/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Redis](https://redis.io/)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

### Installation

_To run the web application run the following commands._

1. Clone the repo
   ```sh
   git clone https://github.com/Adewale66/e-comm-backend.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create env file

   ```sh
   cat .env.example > .env

   ```

4. Run application (Dev)

   ```sh
   npm run start:dev

   ```

   <!-- USAGE EXAMPLES -->

## Usage

### example

To add a product to your cart, use the following endpoint:

```bash
POST /api/v1/cart/items
{
  "productId": 123,
  "quantity": 2
}

```

To update the quantity of a product in cart, use the following endpoint:

```bash
PUT /api/v1/cart/items/:productId
{
  "quantity": 2
}

```

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- Authors -->

## Authors

[Eddy Ukpong](https://github.com/Fahleh) \
[Adewale Kujore](https://github.com/Adewale66)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
