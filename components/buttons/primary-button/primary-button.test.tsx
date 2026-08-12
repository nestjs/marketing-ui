import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import { TransparentButton } from "../transparent-button/transparent-button";
import { PrimaryButton } from "./primary-button";

/*
 * Both components take the same shape, and both used to render `<a href="#">`
 * whatever they were handed — which made every form submit in the product a
 * link. The element has to follow the intent, so the same assertions run
 * against each.
 */
const VARIANTS = [
  ["PrimaryButton", PrimaryButton],
  ["TransparentButton", TransparentButton],
] as const;

describe.each(VARIANTS)("%s", (_name, Button) => {
  it("is a button when it is an action", () => {
    /*
     * The whole point of the fix. As an anchor it was announced as a link,
     * could not submit its form, and did not respond to Enter in a field —
     * on the sign-in, sign-up, reset and confirm forms.
     */
    renderWithProviders(<Button onClick={vi.fn()}>Sign in</Button>);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("is a link when it is navigation", () => {
    // The marketing pages use it for real links, several of them external.
    renderWithProviders(
      <Button href="https://courses.nestjs.com/">Courses</Button>
    );

    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
      "href",
      "https://courses.nestjs.com/"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps the target on a link", () => {
    renderWithProviders(
      <Button href="https://docs.nestjs.com/" target="_blank">
        Docs
      </Button>
    );

    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  it("reports a click either way", async () => {
    const onClick = vi.fn();
    renderWithProviders(<Button onClick={onClick}>Go</Button>);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not submit its form unless asked to", async () => {
    /*
     * A bare `<button>` inside a form defaults to `type="submit"`, which would
     * turn every one of these into a submit overnight — including the ones
     * that only navigate. The default stays explicit.
     */
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    renderWithProviders(
      <form onSubmit={onSubmit}>
        <Button onClick={vi.fn()}>Go</Button>
      </form>
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("can submit its form when asked to", async () => {
    // What lets these forms work from the keyboard, once callers opt in.
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    renderWithProviders(
      <form onSubmit={onSubmit}>
        <Button type="submit">Go</Button>
      </form>
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("PrimaryButton when disabled", () => {
  it("refuses the click properly, not only with a class", async () => {
    /*
     * As an anchor the only guard was `pointer-events: none` in a class list.
     * A real `disabled` attribute takes it out of the tab order too, which is
     * what a keyboard user needs.
     */
    const onClick = vi.fn();
    renderWithProviders(
      <PrimaryButton onClick={onClick} disabled>
        Save
      </PrimaryButton>
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });
});
