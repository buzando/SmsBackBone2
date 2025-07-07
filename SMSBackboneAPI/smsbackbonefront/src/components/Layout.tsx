import NavBarAndMainContent from './AppBarAndMainContent'
type Props = {
    children: React.ReactNode;
}

const Layout: React.FC<Props> = props => {
    return (
        <NavBarAndMainContent>
            {
                props.children
            }
        </NavBarAndMainContent>
    )
}

export default Layout