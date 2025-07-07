import React, { createContext, useState, useEffect } from 'react';
import { UserObj } from '../types/Types';

interface contextType {
	contextState: any; // Tipo de datos del usuario
	setContextState: (state: any) => void; // Función para cambiar el state
}

const contextInitialState = {
	user: {},
	token: '',
	expiration: '',
};

export const AppContext = createContext<contextType>({
	contextState: contextInitialState,
	setContextState: () => { },
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [contextState, setContextState] = useState(contextInitialState);

	useEffect(() => {
		// Recuperamos State y lo metemos al contexto si aun tenemos un usuario logeado
		const expiration = localStorage.getItem('expirationDate');
		const token = localStorage.getItem('token');
		const userString = localStorage.getItem('userData');

		if (userString && token && expiration) {
			console.log('RECUPERANDO DATOS EN EL STADO');
			const user = JSON.parse(userString) as UserObj;
			setContextState({ user, token, expiration });
		} else {
			console.log('SIN DATOS EN EL ALMACENAMIENTO');
			localStorage.clear();
		}
	}, []);

	return (
		<AppContext.Provider value={{ contextState, setContextState }}>
			{children}
		</AppContext.Provider>
	);
};
