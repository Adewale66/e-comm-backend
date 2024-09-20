import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';

export class CustomerUtil {
  async getOrCreateCustomer(stripe: Stripe, user: User) {
    const customerFound = await stripe.customers.search({
      query: `email: "${user.email}"`,
    });

    let customer: Stripe.Customer;

    if (customerFound.data.length === 0) {
      customer = await stripe.customers.create({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      });
    } else {
      customer = customerFound.data[0];
    }

    return customer;
  }
}
