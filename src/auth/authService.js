
const USERS_STORAGE_KEY = 'phonebook_users_file';
const CURRENT_USER_KEY = 'phonebook_current_user';

const initializeUsersFile = () => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    const defaultUsers = [{
      username: 'admin',
      password: 'admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(existingUsers);
};

export const getUsers = async () => {
  return initializeUsersFile();
};

const saveUsersToFile = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  console.log('✅ Users saved to file (localStorage):', users.length, 'users');
  downloadUsersSnapshot(users);
};

const downloadUsersSnapshot = (users) => {
  const dataStr = JSON.stringify(users, null, 2);
  console.log('📄 Current users.json content:\n', dataStr);
};
export const register = async (username, password) => {
  const users = await getUsers();
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  const newUser = {
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsersToFile(users);
  
  console.log('✅ New user registered and written to file:', username);
  
  return { username: newUser.username, role: newUser.role };
};
export const login = async (username, password) => {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    throw new Error('Invalid username or password');
  }
  const userSession = {
    username: user.username,
    role: user.role,
    loginTime: new Date().toISOString()
  }; 
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
  return userSession;
};
export const logout = async () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
export const getCurrentUser = async () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};
export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user && user.role === 'admin';
};
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return user !== null;
};
export const exportUsersFile = async () => {
  const users = await getUsers();
  const dataStr = JSON.stringify(users, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.json';
  link.click();
  URL.revokeObjectURL(url);
  console.log('✅ Users file exported!');
};
