import { useState } from "react";
import { auth } from "../js/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { signOut } from "firebase/auth";
import Modal from "./Modal";
import {gsap} from "gsap";

const Login = ({ setUser, user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = 
      isRegistering
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      loginAnimation()
    } catch (error) {
      setErrorMessage("Usuario o contraseña incorrectos.");
      setIsModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };
  

  return (
    
  <div className="section section-login login-container">
    
      <form className={user ? "nav-shadow-off" : ""}  onSubmit={handleSubmit}>
        <h2 className="h2-title mb-4">Control de Stock</h2>

        <div className="input-group mb-2">
          
            <span className="input-group-text">
              <span className="fas fa-user"></span>
            </span>

          <input
            className="form-control"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group mb-4">

            <span className="input-group-text">
              <span className="fas fa-key"></span>
            </span>

          <input
            className="form-control"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit">
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </button>
        <button
          className="btn btn-register fw-bold"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "Registrase"}
        </button>
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>{errorMessage}</p>
      </Modal>
    </div>
  );
};

export default Login;
