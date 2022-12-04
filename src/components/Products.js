import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Stack,
  Button,
  Avatar,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import useRouteChange from "./RouteChange";
import Cart from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const user = localStorage.getItem("username");
  const token = window.localStorage.getItem("token");
  const routeChangerHome = useRouteChange("/");
  const routeChangerLogin = useRouteChange("/login");
  const routeChangerRegister = useRouteChange("/register");
  const [debounceTimeout, setdebounceTimeout] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  // const [searchedProducts, setSearchedProducts] = useState();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    performAPICall();
    fetchCart(token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    routeChangerHome();
    window.location.reload();
  };

  const textField = (
    <TextField
      key={0}
      className="search-desktop"
      size="small"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search color="primary" />
          </InputAdornment>
        ),
      }}
      placeholder="Search for items/categories"
      name="search"
      onChange={(e) => debounceSearch(e, debounceTimeout)}
    ></TextField>
  );

  const loggedIn = [
    textField,
    <Stack key={1} direction="row" alignItems="center" spacing={1}>
      <Avatar alt={user} src="avatar.png" />
      <p>{user}</p>
      <Button variant="text" onClick={() => handleLogout()}>
        LOGOUT
      </Button>
    </Stack>,
  ];

  const loggedOut = [
    textField,
    <Stack key={1} direction="row" alignItems="center" spacing={1}>
      <Button variant="text" onClick={() => routeChangerLogin()}>
        LOGIN
      </Button>
      <Button variant="contained" onClick={() => routeChangerRegister()}>
        REGISTER
      </Button>
    </Stack>,
  ];

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  const performAPICall = async () => {
    let productsData = null;
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.endpoint}/products`);
      if (res.status === 200) {
        productsData = res.data;
        sessionStorage.setItem('productsData',JSON.stringify(res.data))
      }
    } catch (err) {
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
      setProducts(productsData);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    let data = null;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      if (res.status === 200) data = res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        data = null;
      } else {
        enqueueSnackbar(
          "Something went wrong. Check the backend console for more details",
          { variant: "error" }
        );
      }
    } finally {
      setIsLoading(false);
      setProducts(data);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeOut = setTimeout(() => performSearch(value), 500);
    setdebounceTimeout(newTimeOut);
  };

  /**
   * // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
   * @property {string} productId - Unique ID for the product
   *
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;
    let data = [];

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) data = res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    } finally {
      setCartItems(data);
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.find((item) => item.productId === productId);
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "error",
        });
        return;
      }
      if (options.preventDuplicate) {
        if (isItemInCart(items, productId)) {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            { variant: "warning" }
          );
          return;
        }
      }
      const url = `${config.endpoint}/cart`;
      const itemToBeAdded = {
        productId,
        qty,
      };
      const response = await axios.post(url, itemToBeAdded, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(response.data);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        enqueueSnackbar("Session has expired please login again!", {
          variant: "error",
        });
      }
    }
  };

  return (
    <div>
      <Header hasHiddenAuthButtons>{user ? loggedIn : loggedOut}</Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        onChange={(e) => debounceSearch(e, debounceTimeout)}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid xs={12} md={user ? 9 : 12} item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>

          <Grid container className="products" spacing={2}>
            {isLoading && (
              <Box className="loading">
                <CircularProgress />
                <h3>Loading Products...</h3>
              </Box>
            )}
            {products ? (
              products.map((product, index) => (
                <Grid key={index} item xs={6} md={3}>
                  <ProductCard
                    product={product}
                    handleAddToCart={(id, qty) =>
                      addToCart(token, cartItems, products, id, qty, {
                        preventDuplicate: true,
                      })
                    }
                  />
                </Grid>
              ))
            ) : (
              <Box className="loading">
                <SentimentDissatisfied />
                <h3>No Products Found</h3>
              </Box>
            )}
          </Grid>
        </Grid>
        {user && (
          <Grid className="cart-grid" xs={12} md={3} item>
            <Cart
              products={JSON.parse(sessionStorage.getItem("productsData"))}
              items={cartItems}
              handleQuantity={(id, qty) =>
                addToCart(token, cartItems, products, id, qty)
              }
            />
          </Grid>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
