export function useLocalStorage(key: string) {
  const getItem = () => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  const setItem = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const removeItem = () => {
    localStorage.removeItem(key);
  };

  return { getItem, setItem, removeItem };
}
