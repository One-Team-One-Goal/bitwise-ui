import * as React from 'react'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="w-full h-screen flex justify-center items-center">
        <div className="text-center">
          <h1>bitwise main root, go to __root para maka add kag links lmao</h1>
          <ul>
            <li>
              <Link to="/profile" className="text-blue-600">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/" className="text-blue-600">
                Home
              </Link>
            </li>
          </ul>
          <p>
            para maka add ka ug link adto sa routes folder then add ka ug new
            file, then boom auto generate na yan ni my idol tanstack
          </p>
          <br></br>
          <Outlet />
        </div>
      </div>
    </>
  ),
})
