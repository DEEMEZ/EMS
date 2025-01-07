import { div } from "framer-motion/client";
import OrganizationList from "@/components/organization/orglist/list";
import NavbarComponent from "@/components/navbar/navbar";
export default function OrgList(){
    return(
        <div>
            <NavbarComponent />
            <OrganizationList />
        </div>
    )
}