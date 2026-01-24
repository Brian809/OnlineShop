<template>
    <nav>
        <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="">Login & Register</a></li>
        </ul>
    </nav>
</template>
<style scoped>/* mobile first design (bottom nav bar) */
nav {
    background-color: #333;
    padding: 10px;
    /* make it fixed at the bottom */
    position: fixed;
    bottom: 0;
    width: 100%;
    margin: 0;
    /* padding: 0; */
}   

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: space-around;
}
li a {
    color: white;
    text-decoration: none;
    font-weight: bold;
}
li a:hover {
    text-decoration: underline;
}
@media (min-width: 600px) {
    /* desktop design (top nav bar) */
    nav{
        position: static;
    };
    ul {
        justify-content: flex-start;
    }
    li {
        margin-right: 20px;
    }
}
</style>
<script>
export default {
    name: "Navbar"
};
</script>