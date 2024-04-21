import { useState, useEffect } from 'react'

const LoginRegister = ({ toDo, label })=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = ev => {
    ev.preventDefault();
    toDo({ username, password });
  }
  return (
    <>
     <form onSubmit={ submit }>
      <input value={ username } placeholder='username' onChange={ ev=> setUsername(ev.target.value)}/>
      <input value={ password} placeholder='password' onChange={ ev=> setPassword(ev.target.value)}/>
      <button disabled={ !username || !password }>{label}</button>
      </form>
    </>
  );
}


function App() {
  const [auth, setAuth] = useState({});
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [hasAccount, setHasAccount] = useState(true)

  
  useEffect(()=> {
    const token = window.localStorage.getItem('token');
    if(token){
      attemptLoginWithToken();
    }
  }, []);

  useEffect(()=> {
    const fetchProducts = async()=> {
      const response = await fetch('/api/products');
      const json = await response.json();
      if(response.ok){
        setProducts(json);
      }
      else{
        console.log(json);
      }
    };
    fetchProducts();
  }, []);

  useEffect(()=> {
    const fetchFavorites = async()=> {
      const response = await fetch(`/api/users/${auth.id}/favorites`, {
        headers: {
          authorization: window.localStorage.getItem('token')
        }
      });
      const json = await response.json();
      if(response.ok){
        setFavorites(json);
      }
      else{
        console.log(json);
      }
    };
    if(auth.id){
      fetchFavorites();
    }
    else {
      setFavorites([]);
    }
  }, [auth]);

  const createFavorite = async(product_id)=> {
    const response = await fetch(`/api/users/${auth.id}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ product_id}),
      headers: {
        'Content-Type': 'application/json',
        authorization: window.localStorage.getItem('token')
      }
    });
    const json = await response.json();
    if(response.ok){
      setFavorites([...favorites, json]);
    }
    else {
      console.log(json);
    }
  };

  const removeFavorite = async(id)=> {
    const response = await fetch(`/api/users/${auth.id}/favorites/${id}`, {
      method: 'DELETE',
      headers: {
        authorization: window.localStorage.getItem('token')
      }
    });
    setFavorites(favorites.filter(favorite => favorite.id !== id));
  };

  const attemptLoginWithToken = async()=> {
    const token = window.localStorage.getItem('token');
    const response = await fetch('/api/auth/me', {
      headers: {
        authorization: token
      }
    });
    const json = await response.json();
    if(response.ok){
      setAuth(json);
    }
    else {
      window.localStorage.removeItem('token');
    }
  };

  const login = async(credentials)=> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    if(response.ok){
      window.localStorage.setItem('token', json.token);
      attemptLoginWithToken();
    }
  };

  const register = async(credentials)=> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if(response.ok){
      console.log("Success! Your account has been created.")
    }
    else{
      console.error(result.error)
    }
  };


  const logout = ()=> {
    window.localStorage.removeItem('token');
    setAuth({});
  }


  return (
    <>
      {
        !auth.id ? <>
          {hasAccount? 
            <>
              <h3>Log In</h3>
              <LoginRegister toDo={ login } label={'Log In'}/>
              Don't have an account? 
              <button onClick={()=>{setHasAccount(false)}}>Sign Up</button>
            </>
            : 
            <>
              <h3>New User</h3>
              <LoginRegister toDo={ register } label={'Create Account'}/>
              Already have an account?
              <button onClick={()=>{setHasAccount(true)}}>Login</button>
            </>
          }
        </> 
        : <button onClick={ logout }>Logout { auth.username }</button>
      }
      <ul className='products'>
        {
          products.map( product => {
            const isFavorite = favorites.find(favorite => favorite.product_id === product.id);
            return (
              <li key={ product.id }>
                {
                  auth.id && isFavorite && <div className='remove' onClick={()=> removeFavorite(isFavorite.id)}>-</div>
                }
                {
                  auth.id && !isFavorite && <div className='add' onClick={()=> createFavorite(product.id)}>+</div>
                }
                <div  className={ isFavorite ? 'favorite': 'least-favorite'}>{ product.name }</div>
              </li>
            );
          })
        }
      </ul>
    </>
  )
}

export default App
