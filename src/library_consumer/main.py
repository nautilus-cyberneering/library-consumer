import typer
from typer.main import Typer


app: Typer = typer.Typer()


@app.command()
def test():
    typer.echo("Test")


if __name__ == "__main__":
    app()
