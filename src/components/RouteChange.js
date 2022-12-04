import { useHistory } from "react-router-dom"

export default function useRouteChange (path) {
  const history = useHistory()

  const routeChanger = () =>{ 
    history.push(path);
  }

  return routeChanger
}