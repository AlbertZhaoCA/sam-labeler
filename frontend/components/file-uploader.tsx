import { Button } from "./ui/button";
import {Input} from "./ui/input";

export default function FileUploader() {
    return (
    <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="file"/>
        <Button type="submit">Subscribe</Button>
      </div>
    );
};
